export default function handler(req, res) {
  try {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      method: req.method,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
        hasDbUrl: !!process.env.POSTGRES_PRISMA_URL,
        defaultModel: process.env.DEFAULT_MODEL,
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    })
  }
}