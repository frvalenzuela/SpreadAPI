import { SpreadController } from '../src/controller/SpreadController'
import { Request, Response } from 'express'
import nock = require('nock')

describe('SpreadController', () => {
    let spreadController: SpreadController
    const urlMarkets = 'https://www.buda.com/api/v2/markets'
    const marketId = 'BTC-CLP'
    const urlSingleMarket = `/${marketId}/order_book`
    const marketsObject = {
        markets: [
            { id: 'BTC-CLP' },
            { id: 'ETH-COP' },
            { id: 'BCH-ARS' },
            { id: 'USDC-ARS' },
            { id: 'USDT-USDC' },
        ],
    }
    const SPREAD_VALUE = '306768'
    const SPREAD_VALUE_LESS = '1'
    const SPREAD_VALUE_GT = '406768'
    let mockOrderBook = {
        order_book: {
            asks: [],
            bids: [],
            market_id: marketId,
        },
    }

    beforeEach(() => {
        spreadController = new SpreadController()
        mockOrderBook = {
            order_book: {
                asks: [
                    ['40889760.0', '0.00073862'],
                    ['40920534.0', '0.00186423'],
                    ['40929767.0', '0.157407'],
                    ['40929777.0', '0.35454645'],
                ],
                bids: [
                    ['40582992.0', '0.00036961'],
                    ['40580992.0', '0.17807662'],
                    ['40580980.0', '0.03425376'],
                ],
                market_id: 'BTC-CLP',
            },
        }
    })

    describe('spreadSingleMarketById', () => {
        describe('success', () => {
            it('should spread single market', async () => {
                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedSpread = { status: 200, spread: SPREAD_VALUE }

                const response = await spreadController.spreadSingleMarketById(marketId)

                expect(response).toEqual(mockedSpread)
            })
        })
        describe('errors', () => {
            it('should error when the API of Buda is down', async () => {
                nock(urlMarkets).get(urlSingleMarket).reply(500, 'Internal Server Error')
                const mockedSpread = { status: 500, error: 'External API request failed.' }

                const response = await spreadController.spreadSingleMarketById(marketId)

                expect(response).toEqual(mockedSpread)
            })
            it('should error when the lenght of ask array is 0', async () => {
                mockOrderBook.order_book.asks = []
                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedSpread = {
                    status: 400,
                    error: 'Insufficient data for spread calculation.',
                }

                const response = await spreadController.spreadSingleMarketById(marketId)

                expect(response).toEqual(mockedSpread)
            })
            it('should error when the lenght of bid array is 0', async () => {
                mockOrderBook.order_book.bids = []
                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedSpread = {
                    status: 400,
                    error: 'Insufficient data for spread calculation.',
                }

                const response = await spreadController.spreadSingleMarketById(marketId)

                expect(response).toEqual(mockedSpread)
            })
            it('should error when the lenght of bid array is 0 and lenght of ask array is 0', async () => {
                mockOrderBook.order_book.bids = []
                mockOrderBook.order_book.asks = []
                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedSpread = {
                    status: 400,
                    error: 'Insufficient data for spread calculation.',
                }

                const response = await spreadController.spreadSingleMarketById(marketId)

                expect(response).toEqual(mockedSpread)
            })
        })
    })

    describe('one_market', () => {
        describe('success', () => {
            it('should spread single market', async () => {
                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedRequest: Request = {
                    params: { market_id: marketId },
                } as unknown as Request
                const mockedSpread = { status: 200, spread: SPREAD_VALUE }
                const mockJson = jest.fn(() => mockedSpread)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 200 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.one_market(
                    mockedRequest,
                    mockRes,
                    {} as any,
                )

                expect(response).toEqual(mockedSpread)
                expect(mockStatus).toHaveBeenCalledWith(200)
            })
        })
        describe('errors', () => {
            it('should error when the API of Buda is down', async () => {
                nock(urlMarkets).get(urlSingleMarket).reply(500, 'Internal Server Error')

                const mockedRequest: Request = {
                    params: { market_id: marketId },
                } as unknown as Request
                const mockedSpread = { status: 500, error: 'External API request failed.' }
                const mockJson = jest.fn(() => mockedSpread)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 500 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.one_market(
                    mockedRequest,
                    mockRes,
                    {} as any,
                )
                expect(response).toEqual(mockedSpread)
            })

            it('should error when fetch give error', async () => {
                jest.spyOn(global as any, 'fetch').mockImplementation(() =>
                    Promise.reject(new Error('Simulated fetch error')),
                )

                const mockedRequest: Request = {
                    params: { market_id: marketId },
                } as unknown as Request

                const mockedSpread = {
                    status: 500,
                    error: 'Internal server error.',
                }
                const mockJson = jest.fn(() => mockedSpread)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 500 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.one_market(
                    mockedRequest,
                    mockRes,
                    {} as any,
                )
                expect(response).toEqual(mockedSpread)
            })
        })
    })

    describe('all_market', () => {
        describe('success', () => {
            it('should spread all market', async () => {
                const mockResponse = []
                nock(urlMarkets).get('').reply(200, marketsObject)
                marketsObject.markets.forEach((market) => {
                    mockOrderBook.order_book.market_id = market.id
                    mockResponse.push({ market: market.id, spread: SPREAD_VALUE })
                    nock(urlMarkets).get(`/${market.id}/order_book`).reply(200, mockOrderBook)
                })
                const mockedRequest: Request = {} as unknown as Request
                const mockJson = jest.fn(() => mockResponse)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 200 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.all_market(
                    mockedRequest,
                    mockRes,
                    {} as any,
                )

                expect(response).toEqual(mockResponse)
                expect(mockStatus).toHaveBeenCalledWith(200)
            })
        })
        describe('errors', () => {
            it('should error when the API of Buda for all markets is down', async () => {
                nock(urlMarkets).get('').reply(500, 'Internal Server Error')

                const mockedRequest: Request = {} as unknown as Request
                const mockedSpread = { status: 500, error: 'External API request failed.' }
                const mockJson = jest.fn(() => mockedSpread)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 500 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.all_market(
                    mockedRequest,
                    mockRes,
                    {} as any,
                )
                expect(response).toEqual(mockedSpread)
            })
            it('should error when the API of Buda for one markets is down', async () => {
                nock(urlMarkets).get('').reply(200, marketsObject)
                nock(urlMarkets).get(urlSingleMarket).reply(500, 'Internal Server Error')

                const mockedRequest: Request = {} as unknown as Request
                const mockedSpread = { status: 500, error: 'External API request failed.' }
                const mockJson = jest.fn(() => mockedSpread)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 500 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.all_market(
                    mockedRequest,
                    mockRes,
                    {} as any,
                )
                expect(response).toEqual(mockedSpread)
            })
            it('should error when fetch give error', async () => {
                jest.spyOn(global as any, 'fetch').mockImplementation(() =>
                    Promise.reject(new Error('Simulated fetch error')),
                )

                const mockedRequest: Request = {
                    params: { market_id: marketId },
                } as unknown as Request

                const mockedSpread = {
                    status: 500,
                    error: 'Internal server error.',
                }
                const mockJson = jest.fn(() => mockedSpread)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 500 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.all_market(
                    mockedRequest,
                    mockRes,
                    {} as any,
                )
                expect(response).toEqual(mockedSpread)
            })
        })
    })

    describe('set_alert', () => {
        describe('success', () => {
            it('should set the alert correctly', async () => {
                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        value: '0.5',
                        type_of_alert: 'GREATER',
                    },
                } as unknown as Request
                const mockedAlert = { alert: 'Alert created' }
                const mockJson = jest.fn(() => mockedAlert)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 201 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.set_alert(mockedRequest, mockRes, {} as any)

                expect(response).toEqual(mockedAlert)
                expect(mockStatus).toHaveBeenCalledWith(201)
            })
        })
        describe('errors', () => {
            it('should error when the type alert param is invalid', async () => {
                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        value: '0.5',
                        type_of_alert: 'RANDOM',
                    },
                } as unknown as Request
                const mockedAlert = { error: 'Type of Alert Invalid' }
                const mockJson = jest.fn(() => mockedAlert)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 400 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.set_alert(mockedRequest, mockRes, {} as any)

                expect(response).toEqual(mockedAlert)
                expect(mockStatus).toHaveBeenCalledWith(400)
            })
            it('should error when the value param is invalid', async () => {
                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        type_of_alert: 'LESS',
                    },
                } as unknown as Request
                const mockedAlert = { error: 'Invalid request: value need to be a number' }
                const mockJson = jest.fn(() => mockedAlert)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 400 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.set_alert(mockedRequest, mockRes, {} as any)

                expect(response).toEqual(mockedAlert)
                expect(mockStatus).toHaveBeenCalledWith(400)
            })

            it('should error when the API of Buda is down', async () => {
                nock(urlMarkets).get(urlSingleMarket).reply(500, 'Internal Server Error')

                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        value: '0.5',
                        type_of_alert: 'GREATER',
                    },
                } as unknown as Request
                const mockedSpread = { status: 500, error: 'External API request failed.' }
                const mockJson = jest.fn(() => mockedSpread)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 500 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.set_alert(mockedRequest, mockRes, {} as any)
                expect(response).toEqual(mockedSpread)
            })
            it('should error when fetch give error', async () => {
                jest.spyOn(global as any, 'fetch').mockImplementation(() =>
                    Promise.reject(new Error('Simulated fetch error')),
                )

                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        value: '0.5',
                        type_of_alert: 'LESS',
                    },
                } as unknown as Request

                const mockedSpread = {
                    status: 500,
                    error: 'Internal server error.',
                }
                const mockJson = jest.fn(() => mockedSpread)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 500 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.set_alert(mockedRequest, mockRes, {} as any)
                expect(response).toEqual(mockedSpread)
            })
        })
    })

    describe('alert', () => {
        describe('success', () => {
            it('should set the alert without change', async () => {
                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        value: SPREAD_VALUE,
                        type_of_alert: 'GREATER',
                    },
                } as unknown as Request
                const mockedAlert = { alert: 'Alert created' }
                const mockJson = jest.fn(() => mockedAlert)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 201 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.set_alert(mockedRequest, mockRes, {} as any)

                expect(response).toEqual(mockedAlert)
                expect(mockStatus).toHaveBeenCalledWith(201)

                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedRequest1: Request = {
                    params: {
                        market_id: marketId,
                        type_of_alert: 'GREATER',
                    },
                } as unknown as Request
                const mockedAlert1 = { alert: 'No alert' }
                const mockJson1 = jest.fn(() => mockedAlert1)
                const mockStatus1 = jest.fn(() => ({ json: mockJson1 }))
                mockStatus1.mockImplementationOnce(() => ({ json: mockJson1, status: 304 }))

                const mockRes1 = {
                    status: mockStatus1,
                    json: mockJson1,
                } as unknown as Response

                const response1 = await spreadController.alert(mockedRequest1, mockRes1, {} as any)

                expect(response1).toEqual(mockedAlert1)
                expect(mockStatus1).toHaveBeenCalledWith(304)
            })
            it('should set the alert with change GREATER', async () => {
                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        value: SPREAD_VALUE_LESS,
                        type_of_alert: 'GREATER',
                    },
                } as unknown as Request
                const mockedAlert = { alert: 'Alert created' }
                const mockJson = jest.fn(() => mockedAlert)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 201 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.set_alert(mockedRequest, mockRes, {} as any)

                expect(response).toEqual(mockedAlert)
                expect(mockStatus).toHaveBeenCalledWith(201)

                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedRequest1: Request = {
                    params: {
                        market_id: marketId,
                        type_of_alert: 'GREATER',
                    },
                } as unknown as Request
                const mockedAlert1 = { alert: 'Greater' }
                const mockJson1 = jest.fn(() => mockedAlert1)
                const mockStatus1 = jest.fn(() => ({ json: mockJson1 }))
                mockStatus1.mockImplementationOnce(() => ({ json: mockJson1, status: 200 }))

                const mockRes1 = {
                    status: mockStatus1,
                    json: mockJson1,
                } as unknown as Response

                const response1 = await spreadController.alert(mockedRequest1, mockRes1, {} as any)

                expect(response1).toEqual(mockedAlert1)
                expect(mockStatus1).toHaveBeenCalledWith(200)
            })
            it('should set the alert with change LESS', async () => {
                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        value: SPREAD_VALUE_GT,
                        type_of_alert: 'LESS',
                    },
                } as unknown as Request
                const mockedAlert = { alert: 'Alert created' }
                const mockJson = jest.fn(() => mockedAlert)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 201 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.set_alert(mockedRequest, mockRes, {} as any)

                expect(response).toEqual(mockedAlert)
                expect(mockStatus).toHaveBeenCalledWith(201)

                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedRequest1: Request = {
                    params: {
                        market_id: marketId,
                        type_of_alert: 'LESS',
                    },
                } as unknown as Request
                const mockedAlert1 = { alert: 'Greater' }
                const mockJson1 = jest.fn(() => mockedAlert1)
                const mockStatus1 = jest.fn(() => ({ json: mockJson1 }))
                mockStatus1.mockImplementationOnce(() => ({ json: mockJson1, status: 200 }))

                const mockRes1 = {
                    status: mockStatus1,
                    json: mockJson1,
                } as unknown as Response

                const response1 = await spreadController.alert(mockedRequest1, mockRes1, {} as any)

                expect(response1).toEqual(mockedAlert1)
                expect(mockStatus1).toHaveBeenCalledWith(200)
            })
        })
        describe('errors', () => {
            it('should error when the type alert param is invalid', async () => {
                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        type_of_alert: 'RANDOM',
                    },
                } as unknown as Request
                const mockedAlert = { error: 'Type of Alert Invalid' }
                const mockJson = jest.fn(() => mockedAlert)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 400 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.alert(mockedRequest, mockRes, {} as any)

                expect(response).toEqual(mockedAlert)
                expect(mockStatus).toHaveBeenCalledWith(400)
            })
            it('should error when the alert is not set', async () => {
                const mockedRequest: Request = {
                    params: {
                        market_id: 'RANDOM',
                        type_of_alert: 'LESS',
                    },
                } as unknown as Request
                const mockedAlert = { error: 'Alert not found' }
                const mockJson = jest.fn(() => mockedAlert)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 400 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.alert(mockedRequest, mockRes, {} as any)

                expect(response).toEqual(mockedAlert)
                expect(mockStatus).toHaveBeenCalledWith(400)
            })
            it('should error when the API of Buda is down', async () => {
                nock(urlMarkets).get(urlSingleMarket).reply(200, mockOrderBook)
                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        value: SPREAD_VALUE,
                        type_of_alert: 'GREATER',
                    },
                } as unknown as Request
                const mockedAlert = { alert: 'Alert created' }
                const mockJson = jest.fn(() => mockedAlert)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 201 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.set_alert(mockedRequest, mockRes, {} as any)

                expect(response).toEqual(mockedAlert)
                expect(mockStatus).toHaveBeenCalledWith(201)

                nock(urlMarkets).get(urlSingleMarket).reply(500, 'Internal Server Error')
                const mockedRequest1: Request = {
                    params: {
                        market_id: marketId,
                        type_of_alert: 'GREATER',
                    },
                } as unknown as Request
                const mockedAlert1 = { error: 'External API request failed.' }
                const mockJson1 = jest.fn(() => mockedAlert1)
                const mockStatus1 = jest.fn(() => ({ json: mockJson1 }))
                mockStatus1.mockImplementationOnce(() => ({ json: mockJson1, status: 500 }))

                const mockRes1 = {
                    status: mockStatus1,
                    json: mockJson1,
                } as unknown as Response

                const response1 = await spreadController.alert(mockedRequest1, mockRes1, {} as any)

                expect(response1).toEqual(mockedAlert1)
                expect(mockStatus1).toHaveBeenCalledWith(500)
            })
            it('should error when fetch give error', async () => {
                jest.spyOn(global as any, 'fetch').mockImplementation(() =>
                    Promise.reject(new Error('Simulated fetch error')),
                )

                const mockedRequest: Request = {
                    params: {
                        market_id: marketId,
                        type_of_alert: 'LESS',
                    },
                } as unknown as Request

                const mockedSpread = {
                    status: 500,
                    error: 'Internal server error.',
                }
                const mockJson = jest.fn(() => mockedSpread)
                const mockStatus = jest.fn(() => ({ json: mockJson }))
                mockStatus.mockImplementationOnce(() => ({ json: mockJson, status: 500 }))

                const mockRes = {
                    status: mockStatus,
                    json: mockJson,
                } as unknown as Response

                const response = await spreadController.alert(mockedRequest, mockRes, {} as any)
                expect(response).toEqual(mockedSpread)
            })
        })
    })
})
