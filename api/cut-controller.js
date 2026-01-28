const allowedOrigins = new Set([
  'https://drdfitness.co.uk',
  'https://www.drdfitness.co.uk',
  'https://drdfitness-landing.vercel.app'
]);

function setCors(res, origin) {
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function round(value, decimals = 0) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function calculate({ sex, age, height, weight, activity_level }) {
  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    athlete: 1.9
  };

  const activity = activityMap[activity_level] ?? 1.55;
  const bmr = sex === 'female'
    ? (10 * weight) + (6.25 * height) - (5 * age) - 161
    : (10 * weight) + (6.25 * height) - (5 * age) + 5;

  const tdee = bmr * activity;
  const weeklyLossTarget = round(weight * 0.005, 2); // ~0.5% bodyweight/week
  const dailyDeficit = (weeklyLossTarget * 7700) / 7;
  const targetCalories = Math.max(1200, tdee - dailyDeficit);

  const protein = round(weight * 2, 0);
  const fats = round(weight * 0.8, 0);
  const remainingCalories = targetCalories - (protein * 4) - (fats * 9);
  const carbs = Math.max(0, round(remainingCalories / 4, 0));

  return {
    tdee_kcal: round(tdee, 0),
    target_calories_kcal: round(targetCalories, 0),
    weekly_loss_target_kg: weeklyLossTarget,
    macros: {
      protein_g: protein,
      carbs_g: carbs,
      fats_g: fats
    }
  };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  setCors(res, origin);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const required = ['sex', 'age', 'height', 'weight', 'activity_level'];
    for (const key of required) {
      if (body?.[key] === undefined || body?.[key] === null || body?.[key] === '') {
        return res.status(400).json({ error: `Missing field: ${key}` });
      }
    }

    const payload = {
      sex: body.sex,
      age: Number(body.age),
      height: Number(body.height),
      weight: Number(body.weight),
      activity_level: body.activity_level
    };

    const result = calculate(payload);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
}
