// api/remove-bg.js — Background Removal API
// Makes tattoo images transparent for the virtual try-on feature

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageUrl } = req.body;
  if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

  try {
    // Use fal.ai birefnet model — best for clean cutouts on white backgrounds
    const response = await fetch('https://fal.run/fal-ai/birefnet', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        model: 'General Use (Light)',
        operating_resolution: '1024x1024',
        output_format: 'png',
        refine_foreground: true,
      }),
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();

    return res.status(200).json({ imageUrl: data.image.url });
  } catch (err) {
    console.error('BG removal error:', err);
    return res.status(500).json({ error: 'Background removal failed' });
  }
}
