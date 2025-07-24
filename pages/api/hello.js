export default function handler(req, res) {
  res.status(200).json({ 
    message: 'Pages API route working!',
    timestamp: new Date().toISOString(),
    method: req.method
  })
}