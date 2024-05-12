// reset on data fetch

import { PageOptions } from '@graphcommerce/framer-next-pages'
import { StoreConfigDocument } from '@graphcommerce/magento-store'
import { GetStaticProps, LayoutOverlayHeader, LayoutTitle, PageMeta } from '@graphcommerce/next-ui'
import { useEffect, useState } from 'react'
import { LayoutDocument, LayoutNavigation, LayoutNavigationProps } from '../../components'
import { graphqlSharedClient, graphqlSsrClient } from '../../lib/graphql/graphqlSsrClient'
import { Card, Container } from '@mui/material'

type GetPageStaticProps = GetStaticProps<LayoutNavigationProps>

interface WeatherData {
  name: string
  weather: { description: string }[]
  main: { temp: number; humidity: number }
  wind: { speed: number }
}

function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        const endpoint =
          latitude && longitude ? `/api/weather?lat=${latitude}&lon=${longitude}` : '/api/weather'
        const response = await fetch(endpoint, { method: 'GET' })
        const data = await response.json()
        setWeather(data)
      })
    }

    fetchWeather()
  }, [])

  const kelvinToCelsius = (kelvin: number) => {
    return (kelvin - 273.15).toFixed(2)
  }

  return (
    <>
      <LayoutOverlayHeader>
        <LayoutTitle size='small' component='span'>
          Weather
        </LayoutTitle>
      </LayoutOverlayHeader>
      <PageMeta title='Weather' />
      <LayoutTitle variant='h2' size='medium' gutterBottom={false}>
        Weather 🌤️
      </LayoutTitle>
      <div
        style={{
          margin: '2rem',
          minHeight: '50vh',
          borderRadius: '1rem',
          backgroundColor: '#f5f5f5',
          backgroundImage: `url('/weather.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container style={{ padding: '2rem' }} maxWidth='sm'>
          <Card
            style={{
              padding: '2rem',
              borderRadius: '2rem',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
              backgroundColor: 'transparent',
              boxShadow: '0 0 10px 0 rgba(0,0,0,0.1)',
            }}
          >
            {weather ? (
              <div>
                <h1>{weather.name}</h1>
                <h3>
                  Description:
                  <b> {weather.weather[0].description} </b>
                </h3>
                <p>Temperature: {kelvinToCelsius(weather.main.temp)}°C</p>
                <p>Wind Speed: {weather.wind.speed} km/h</p>
                <p>Humidity: {weather.main.humidity}%</p>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </Card>
        </Container>
      </div>
    </>
  )
}

const pageOptions: PageOptions<LayoutNavigationProps> = {
  Layout: LayoutNavigation,
}
Weather.pageOptions = pageOptions

export default Weather

export const getStaticProps: GetPageStaticProps = async ({ locale }) => {
  const client = graphqlSharedClient(locale)
  const staticClient = graphqlSsrClient(locale)

  const conf = client.query({ query: StoreConfigDocument })
  const layout = staticClient.query({
    query: LayoutDocument,
    fetchPolicy: 'network-only',
  })

  return {
    props: {
      ...(await layout).data,
      up: { href: '/', title: 'Home' },
      apolloState: await conf.then(() => client.cache.extract()),
    },
    revalidate: 60 * 20,
  }
}
