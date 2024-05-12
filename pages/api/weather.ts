import { NextApiRequest, NextApiResponse } from 'next'

const WEATHER_API_KEY = '79ae7c9486e05cbc16fecaed94ed7fac'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  let { lat, lon } = req.query

  if (!lat || !lon) {
    lat = '47.6062'
    lon = '-122.3321'
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}`

  const response = await fetch(url)
  const data = await response.json()

  res.status(200).json(data)
}
