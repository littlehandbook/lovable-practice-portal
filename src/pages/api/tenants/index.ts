
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization
  const url = `${process.env.MS_API_URL}/tenants`
  const init: RequestInit = {
    headers: { 'Content-Type': 'application/json', Authorization: token || '' },
    method: req.method,
    body: req.method === 'POST' ? JSON.stringify(req.body) : undefined
  }

  try {
    const apiRes = await fetch(url, init)
    const data = await apiRes.json()
    return res.status(apiRes.status).json(data)
  } catch (e: any) {
    console.error('tenants index error', e)
    return res.status(500).json({ error: e.message })
  }
}
