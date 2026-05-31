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

  const response = await fetch('https://app.ringy.com/api/public/leads/new-lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  return { statusCode: response.status, body: JSON.stringify(result) };
};
