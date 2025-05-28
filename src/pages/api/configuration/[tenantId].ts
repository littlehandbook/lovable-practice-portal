
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tenantId } = req.query
  const token = req.headers.authorization

  const url = `${process.env.MS_API_URL}/configuration/${tenantId}`
  const init: RequestInit = {
    headers: { 'Content-Type': 'application/json', Authorization: token || '' },
    method: req.method,
    body: req.method === 'PUT' ? JSON.stringify(req.body) : undefined
  }

  try {
    const apiRes = await fetch(url, init)
    const data = await apiRes.json()
    return res.status(apiRes.status).json(data)
  } catch (e: any) {
    console.error('configuration error', e)
    return res.status(500).json({ error: e.message })
  }
}
