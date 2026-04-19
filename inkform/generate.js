// api/generate.js — Inkform Tattoo Generation API
// Vercel Serverless Function — deploy inside /api folder

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, style = '', placement = '', size = '', count = 2 } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const imageCount = Math.min(Math.max(parseInt(count) || 2, 1), 4);

  try {
    const builtPrompt = buildPreciseTattooPrompt(prompt.slice(0, 500), style, placement, size);

    // Generate all variations in parallel for speed
    const results = await Promise.all(
      Array.from({ length: imageCount }, () => callFalAI(builtPrompt))
    );

    return res.status(200).json({
      images: results.map(r => r.images[0].url),
      debugPrompt: builtPrompt,
    });
  } catch (err) {
    console.error('Generation error:', err);
    return res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
}

async function callFalAI(prompt) {
  const response = await fetch('https://fal.run/fal-ai/flux-pro/v1.1', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${process.env.FAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: 'square_hd',
      num_inference_steps: 28,
      guidance_scale: 3.5,
      num_images: 1,
      safety_tolerance: '2',
      output_format: 'png',
    }),
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// ─────────────────────────────────────────────────
// PRECISION PROMPT BUILDER
// Maps user intent exactly to tattoo-quality output
// ─────────────────────────────────────────────────
function buildPreciseTattooPrompt(userPrompt, style, placement, size) {
  const parts = [
    // 1. User's exact description comes first — highest model attention
    userPrompt,

    // 2. Style-specific directives
    getStyleDirectives(style),

    // 3. Placement-aware composition
    getPlacementDirectives(placement),

    // 4. Size-aware detail level
    getSizeDirectives(size),

    // 5. Universal tattoo quality requirements
    'professional tattoo flash art',
    'tattoo stencil ready',
    'pure black ink lines on pure white background',
    'no background scenery or elements',
    'design isolated on white',
    'centered composition',
    'crisp technically precise linework',
    'high contrast black and white only',
    'drawn by a master tattoo artist with 20 years experience',
    'anatomically accurate subject matter',
    'clean smooth curves and sharp straight lines',
    'suitable for skin application',
    'no watermark no text no color no grey shading no border frame',
  ].filter(Boolean).join(', ');

  return parts;
}

function getStyleDirectives(style) {
  const map = {
    'Fine line':   'ultra-fine single needle linework, hair-thin delicate lines, elegant negative space, fine line tattoo technique, minimal weight variation',
    'Blackwork':   'bold heavy blackwork, solid black fills, strong graphic contrast, blackwork tattoo style, thick confident strokes',
    'Geometric':   'mathematically precise geometry, sacred geometry patterns, perfect symmetry, dotwork shading fills, geometric tattoo style',
    'Japanese':    'traditional Japanese irezumi, bold outlines, dynamic wind bars, koi or waves if relevant, classic Japanese tattoo composition and balance',
    'Minimalist':  'absolute minimalism, single continuous line or minimal dots, essential form stripped to basics, maximum negative space',
    'Watercolour': 'watercolour splash effect tattoo, ink bleed and wash at edges, loose expressive marks, black linework anchor with watercolour feel',
    'Neo-trad':    'neo-traditional tattoo, bold illustrative outlines, slightly thickened lines, art nouveau influence, decorative flourishes',
    'Realism':     'photorealistic black and grey tattoo, hyper-detailed shading, three-dimensional depth, realistic portrait quality linework',
    'Dotwork':     'pure stipple dotwork, composed entirely of dots varying in density, pointillist shading, no lines only dots',
    'Tribal':      'bold solid tribal patterns, rhythmic geometric repetition, symmetrical tribal motifs, strong black fills',
    'Old school':  'traditional American sailor tattoo, thick bold outlines, classic flash art, strong simple imagery, old school tattoo style',
    'Sketch':      'pencil sketch tattoo aesthetic, loose confident strokes, hand-drawn feel, artistic imperfection, sketch tattoo style',
    'Ornamental':  'ornamental tattoo, mandala-like decorative elements, lace-like intricacy, jewellery-inspired, ornamental symmetry',
  };
  return map[style] || 'professional tattoo art, clean linework';
}

function getPlacementDirectives(placement) {
  const map = {
    'Forearm':    'elongated vertical composition, designed for forearm wrap, longer than wide',
    'Upper arm':  'medium composition works with arm curvature, suitable for bicep or outer upper arm',
    'Wrist':      'small compact design, delicate scale, suitable for wrist band or inner wrist',
    'Chest':      'wide centered composition, bilateral symmetry if applicable, chest panel proportions',
    'Back':       'large detailed composition, back panel scale, fills space with intricate detail',
    'Shoulder':   'rounded composition, shoulder cap shape, flows around the joint',
    'Calf':       'vertical elongated composition, designed for calf muscle shape, tapered at ends',
    'Ankle':      'small refined design, works around ankle bone, delicate and minimal',
    'Neck':       'small upward-pointing design, slim and elongated, refined for neck placement',
    'Ribs':       'narrow vertical design, flows along rib direction, elongated and elegant',
    'Hand':       'bold clear design, reads at small scale, works on hand dorsum',
    'Finger':     'single tiny element, ultra minimal, works at extreme small scale on finger',
    'Sternum':    'vertical symmetrical design, sternum underboob style, elongated with mirrored elements',
    'Spine':      'ultra-slim vertical design, single column, follows spine from neck to lower back',
  };
  return map[placement] || '';
}

function getSizeDirectives(size) {
  const map = {
    'Tiny':   'micro tattoo design, reads clearly at 1 inch, minimal linework only most essential elements',
    'Small':  'small tattoo, clean and simple, reads well at 2-3 inches, limited detail',
    'Medium': 'medium tattoo design, moderate detail, reads at 4-6 inches, balanced linework',
    'Large':  'large detailed tattoo, intricate linework, full detail at 6-10 inches, complex composition',
    'Sleeve': 'sleeve panel element, very large highly complex design, extreme detail, fills large body area',
  };
  return map[size] || '';
}
