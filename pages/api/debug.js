export default function handler(req, res) {
  console.log('=== DEBUG API ===')
  console.log('Method:', req.method)
  console.log('Headers:', req.headers)
  console.log('Body type:', typeof req.body)
  console.log('Body:', req.body)
  console.log('Raw body:', JSON.stringify(req.body))
  
  res.status(200).json({ 
    received: req.body,
    type: typeof req.body,
    method: req.method 
  })
}