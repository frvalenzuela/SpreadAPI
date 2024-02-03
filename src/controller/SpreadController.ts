import { Request, Response, NextFunction } from 'express'
import fetch from 'node-fetch'
import { Decimal } from 'decimal.js'

const urlMarkets = 'https://www.buda.com/api/v2/markets'

const alerts: Map<string, string> = new Map()

enum TypeOfAlert {
    GREATER = 'GREATER',
    LESS = 'LESS',
}

export class SpreadController {
    async spreadSingleMarketById(marketId: string) {
        const orderBookResponse = await fetch(`${urlMarkets}/${marketId}/order_book`)

        if (!orderBookResponse.ok) {
            return { status: orderBookResponse.status, error: 'External API request failed.' }
        }

        const responseData = await orderBookResponse.json()

        const orderBook = responseData['order_book']
        const askArray = orderBook.asks
        const bidArray = orderBook.bids

        if (askArray.length === 0 || bidArray.length === 0) {
            return { status: 400, error: 'Insufficient data for spread calculation.' }
        }
        const decimalAskArray: [Decimal, string][] = askArray.map(([first, second]) => [
            new Decimal(first),
            second,
        ])
        const decimalBidArray: [Decimal, string][] = bidArray.map(([first, second]) => [
            new Decimal(first),
            second,
        ])
        decimalAskArray.sort((a, b) => a[0].comparedTo(b[0]))
        decimalBidArray.sort((a, b) => b[0].comparedTo(a[0]))

        const firstValue = decimalAskArray[0][0].minus(decimalBidArray[0][0])
        return { status: 200, spread: firstValue.toString() }
    }
    async one_market(request: Request, response: Response, next: NextFunction) {
        try {
            const marketId = request.params.market_id

            const objectResponse = await this.spreadSingleMarketById(marketId)
            if (objectResponse.status !== 200) {
                return response.status(objectResponse.status).json({ error: objectResponse.error })
            }

            return response.status(objectResponse.status).json({ spread: objectResponse.spread })
        } catch (error) {
            return response.status(500).json({ error: 'Internal server error.' })
        }
    }
    async all_market(request: Request, response: Response, next: NextFunction) {
        try {
            const allMarket = await fetch(`${urlMarkets}`)
            if (!allMarket.ok) {
                return response
                    .status(allMarket.status)
                    .json({ error: 'External API request failed.' })
            }
            const responseData = await allMarket.json()
            const markets = responseData['markets']
            const allSpreadArray = []
            for await (const market of markets) {
                if (market.id.slice(-3) === 'ARS') {
                    continue
                }
                const singleMarket = await this.spreadSingleMarketById(market.id)
                if (singleMarket.status !== 200) {
                    return response.status(singleMarket.status).json({ error: singleMarket.error })
                }
                allSpreadArray.push({ market: market.id, spread: singleMarket.spread })
            }
            return response.status(200).json(allSpreadArray)
        } catch (error) {
            return response.status(500).json({ error: 'Internal server error.' })
        }
    }
    async set_alert(request: Request, response: Response, next: NextFunction) {
        try {
            const marketId = request.params.market_id
            const value = request.params.value
            const type_of_alert = request.params.type_of_alert
            if (type_of_alert !== TypeOfAlert.GREATER && type_of_alert !== TypeOfAlert.LESS) {
                return response.status(400).json({ error: 'Type of Alert Invalid' })
            }
            const isValidNumber = /^-?\d*\.?\d+$/.test(value)
            if (!isValidNumber) {
                return response
                    .status(400)
                    .json({ error: 'Invalid request: value need to be a number' })
            }
            const objectResponse = await this.spreadSingleMarketById(marketId)
            if (objectResponse.status !== 200) {
                return response.status(objectResponse.status).json({ error: objectResponse.error })
            }
            const idSet = `${marketId}-${type_of_alert}`
            alerts.set(idSet, value)
            return response.status(201).json({ alert: 'Alert created' })
        } catch (error) {
            return response.status(500).json({ error: 'Internal server error.' })
        }
    }
    async alert(request: Request, response: Response, next: NextFunction) {
        try {
            const marketId = request.params.market_id
            const type_of_alert = request.params.type_of_alert
            if (type_of_alert !== TypeOfAlert.GREATER && type_of_alert !== TypeOfAlert.LESS) {
                return response.status(400).json({ error: 'Type of Alert Invalid' })
            }
            const idSet = `${marketId}-${type_of_alert}`
            if (!alerts.has(idSet)) {
                return response.status(400).json({ error: 'Alert not found' })
            }
            const objectResponse = await this.spreadSingleMarketById(marketId)
            if (objectResponse.status !== 200) {
                return response.status(objectResponse.status).json({ error: objectResponse.error })
            }
            const spread = new Decimal(objectResponse.spread)
            const value = new Decimal(alerts.get(idSet))
            if (type_of_alert === TypeOfAlert.GREATER && spread.greaterThan(value)) {
                return response.status(200).json({ alert: 'Greater' })
            }
            if (type_of_alert === TypeOfAlert.LESS && spread.lessThan(value)) {
                return response.status(200).json({ alert: 'Less' })
            }
            return response.status(304).json({ alert: 'No alert' })
        } catch (error) {
            return response.status(500).json({ error: 'Internal server error.' })
        }
    }
}
