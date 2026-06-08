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

  const payload = {
    sid:          process.env.RINGY_SID,
    authToken:    process.env.RINGY_AUTH_TOKEN,
    phone_number: data.phone,
    email:        data.email,
    first_name:   data.firstName,
    last_name:    data.lastName,
    zip:          data.zip,
    // Additional lead context sent as notes/custom fields
    coverage_type: data.coverageType,
    reason:        data.reason,
    age:           data.age,
    health:        data.health,
    budget:        data.budget,
    beneficiary:   data.beneficiary,
    timeline:      data.timeline,
  };

  // Log what we're sending to Ringy (redact credentials)
  console.log('Sending to Ringy:', JSON.stringify({
    ...payload,
    sid: payload.sid ? '[SET]' : '[MISSING]',
    authToken: payload.authToken ? '[SET]' : '[MISSING]',
  }));

  try {
    const response = await fetch('https://app.ringy.com/api/public/leads/new-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));

    // Log the full Ringy response for debugging
    console.log('Ringy response status:', response.status);
    console.log('Ringy response body:', JSON.stringify(result));

    if (!response.ok) {
      console.error('Ringy returned non-OK status:', response.status, JSON.stringify(result));
    }

    return { statusCode: response.status, body: JSON.stringify(result) };
  } catch (err) {
    console.error('Ringy API error:', err);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Failed to reach Ringy API', detail: err.message }),
    };
  }
};
