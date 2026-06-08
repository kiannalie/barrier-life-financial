exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  // Server-side guard: reject leads missing required contact fields
  const missing = ['firstName', 'lastName', 'phone', 'email'].filter(f => !data[f] || !String(data[f]).trim());
  if (missing.length) {
    console.error('BLOCKED: missing required fields:', missing);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields', fields: missing }),
    };
  }

  // ── 1. Ringy payload ──────────────────────────────────────────────────────
  // System fields (phone_number, email, first_name, last_name, zip) are
  // standard Ringy fields. All others are custom fields — their key names
  // must match exactly what Thomas has entered in Lead Field Mapping in Ringy.
  const ringyPayload = {
    sid:              process.env.RINGY_SID,
    authToken:        process.env.RINGY_AUTH_TOKEN,
    // Standard Ringy system fields
    phone_number:     data.phone,
    email:            data.email,
    first_name:       data.firstName,
    last_name:        data.lastName,
    zip:              data.zip,
    // Custom fields — displayed in the lead profile under "Other Info"
    'Coverage Type':  data.coverageType,
    'Reason':         data.reason,
    'Age Range':      data.age,
    'Health':         data.health,
    'Monthly Budget': data.budget,
    'Beneficiary':    data.beneficiary,
    'Timeline':       data.timeline,
  };

  console.log('Sending to Ringy:', JSON.stringify({
    ...ringyPayload,
    sid:       ringyPayload.sid       ? '[SET]' : '[MISSING]',
    authToken: ringyPayload.authToken ? '[SET]' : '[MISSING]',
  }));

  // ── 2. Google Sheets payload ──────────────────────────────────────────────
  const sheetPayload = {
    timestamp:      new Date().toISOString(),
    firstName:      data.firstName,
    lastName:       data.lastName,
    phone:          data.phone,
    email:          data.email,
    zip:            data.zip,
    coverageType:   data.coverageType,
    reason:         data.reason,
    age:            data.age,
    health:         data.health,
    budget:         data.budget,
    beneficiary:    data.beneficiary,
    timeline:       data.timeline,
  };

  // ── 3. Fire both requests in parallel ────────────────────────────────────
  const ringyPromise = fetch('https://app.ringy.com/api/public/leads/new-lead', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(ringyPayload),
  });

  const sheetWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  const sheetPromise = sheetWebhookUrl
    ? fetch(sheetWebhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(sheetPayload),
      })
    : Promise.resolve(null);

  // ── 4. Await both; Sheets failure never blocks Ringy ─────────────────────
  const [ringyResponse, sheetResponse] = await Promise.allSettled([
    ringyPromise,
    sheetPromise,
  ]);

  // Ringy result
  let ringyStatus = 502;
  let ringyResult = {};
  if (ringyResponse.status === 'fulfilled' && ringyResponse.value) {
    ringyStatus = ringyResponse.value.status;
    ringyResult = await ringyResponse.value.json().catch(() => ({}));
    console.log('Ringy response status:', ringyStatus);
    console.log('Ringy response body:', JSON.stringify(ringyResult));
    if (ringyStatus < 200 || ringyStatus >= 300) {
      console.error('Ringy returned non-OK status:', ringyStatus, JSON.stringify(ringyResult));
    }
  } else {
    console.error('Ringy request failed:', ringyResponse.reason);
  }

  // Google Sheets result (non-blocking — log only)
  if (!sheetWebhookUrl) {
    console.warn('GOOGLE_SHEET_WEBHOOK_URL not set — skipping Sheet backup');
  } else if (sheetResponse.status === 'fulfilled' && sheetResponse.value) {
    const sheetStatus = sheetResponse.value.status;
    console.log('Google Sheet response status:', sheetStatus);
    if (sheetStatus < 200 || sheetStatus >= 300) {
      console.error('Google Sheet returned non-OK status:', sheetStatus);
    }
  } else {
    console.error('Google Sheet request failed:', sheetResponse.reason);
  }

  // Return Ringy's response to the browser (Sheet is a silent backup)
  return {
    statusCode: ringyStatus,
    body: JSON.stringify(ringyResult),
  };
};
