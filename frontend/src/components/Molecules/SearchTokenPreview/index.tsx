"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, ExternalLink } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TokenData {
  id: string
  symbol: string
  name: string
  description: { en: string }
  image: {
    large: string
    small: string
    thumb: string
  }
  market_data: {
    current_price: { [key: string]: number }
    price_change_percentage_24h: number
    price_change_percentage_7d: number
    price_change_percentage_30d: number
    market_cap: { [key: string]: number }
    total_volume: { [key: string]: number }
    circulating_supply: number
    total_supply: number
    max_supply: number
  }
  categories: string[]
  links: {
    homepage: string[]
    blockchain_site: string[]
  }
  tickers: Array<{
    market: {
      name: string
    }
    trust_score: string
    last: number
    volume: number
    converted_volume: {
      usd: number
    }
  }>
}

export default function TokenDisplay({ tokenData }: { tokenData: TokenData }) {
  const [currency] = useState("usd")

  const formatNumber = (num: number, decimals = 2) => {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

  const formatCurrency = (value: number, symbol = "$") => {
    return `${symbol}${formatNumber(value)}`
  }

  const formatPercentage = (value: number) => {
    const isPositive = value >= 0
    return (
      <span className={`flex items-center ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
        {Math.abs(value).toFixed(2)}%
      </span>
    )
  }

  const topExchanges = tokenData.tickers.sort((a, b) => b.converted_volume.usd - a.converted_volume.usd).slice(0, 5)

  const getTrustScoreColor = (score: string) => {
    switch (score) {
      case "green":
        return "bg-green-500"
      case "yellow":
        return "bg-yellow-500"
      case "red":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-black text-white">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Token Header */}
        <Card className="w-full md:w-1/3 bg-[#1A1A1A] border-[#3b3b3b]">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <img
                src={tokenData.image.large || "/placeholder.svg"}
                alt={tokenData.name}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <CardTitle className="text-2xl text-white">{tokenData.name}</CardTitle>
                <CardDescription className="text-lg uppercase text-white">{tokenData.symbol}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-white">
                  {formatCurrency(tokenData.market_data.current_price[currency])}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {formatPercentage(tokenData.market_data.price_change_percentage_24h)}
                  <span className="text-sm text-muted-foreground text-gray-400">24h</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {tokenData.categories.slice(0, 3).map((category, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-[#3b3b3b] border-[#3b3b3b] text-gray-300 hover:bg-[#4b4b4b]"
                  >
                    {category}
                  </Badge>
                ))}
                {tokenData.categories.length > 3 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">+{tokenData.categories.length - 3} more</Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-[#1A1A1A] border-[#3b3b3b]">
                        <div className="max-w-xs">{tokenData.categories.slice(3).join(", ")}</div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0">
            <a
              href={tokenData.links.homepage[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm flex items-center text-blue-500 hover:underline text-blue-400"
            >
              Official Website <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </CardFooter>
        </Card>

        {/* Market Stats */}
        <Card className="w-full md:w-2/3 bg-[#1A1A1A] border-[#3b3b3b]">
          <CardHeader>
            <CardTitle className="text-white">Market Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground text-gray-400">Market Cap</div>
                <div className="font-medium text-white">{formatCurrency(tokenData.market_data.market_cap[currency])}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground text-gray-400">24h Volume</div>
                <div className="font-medium text-white">{formatCurrency(tokenData.market_data.total_volume[currency])}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground text-gray-400">Circulating Supply</div>
                <div className="font-medium text-white">
                  {formatNumber(tokenData.market_data.circulating_supply, 0)} {tokenData.symbol.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground text-gray-400">Total Supply</div>
                <div className="font-medium text-white">
                  {formatNumber(tokenData.market_data.total_supply, 0)} {tokenData.symbol.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground text-gray-400">Max Supply</div>
                <div className="font-medium text-white">
                  {formatNumber(tokenData.market_data.max_supply, 0)} {tokenData.symbol.toUpperCase()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground text-gray-400">7d Change</div>
                <div className="font-medium">{formatPercentage(tokenData.market_data.price_change_percentage_7d)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4 bg-[#1A1A1A] border-[#3b3b3b] text-white">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#3b3b3b] data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="exchanges" className="data-[state=active]:bg-[#3b3b3b] data-[state=active]:text-white">Exchanges</TabsTrigger>
          <TabsTrigger value="price-history" className="data-[state=active]:bg-[#3b3b3b] data-[state=active]:text-white">Price History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-[#1A1A1A] border-[#3b3b3b]">
            <CardHeader>
              <CardTitle className="text-white">About {tokenData.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">{tokenData.description.en}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1A1A] border-[#3b3b3b]">
            <CardHeader>
              <CardTitle className="text-white">Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tokenData.links.blockchain_site
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((site, index) => (
                    <a
                      key={index}
                      href={site}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center text-blue-500 hover:underline truncate text-blue-400"
                    >
                      {site.replace(/^https?:\/\//, "")} <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                    </a>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exchanges">
          <Card className="bg-[#1A1A1A] border-[#3b3b3b]">
            <CardHeader>
              <CardTitle className="text-white">Top Exchanges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-4 text-white">Exchange</th>
                      <th className="text-left py-2 px-4 text-white">Trust Score</th>
                      <th className="text-right py-2 px-4 text-white">Price</th>
                      <th className="text-right py-2 px-4 text-white">24h Volume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topExchanges.map((exchange, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-2 px-4 text-white">{exchange.market.name}</td>
                        <td className="py-2 px-4">
                          {exchange.trust_score && (
                            <div className={`w-3 h-3 rounded-full ${getTrustScoreColor(exchange.trust_score)}`} />
                          )}
                        </td>
                        <td className="text-right py-2 px-4 text-white">${formatNumber(exchange.last)}</td>
                        <td className="text-right py-2 px-4 text-white">${formatNumber(exchange.converted_volume.usd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="price-history">
          <Card className="bg-[#1A1A1A] border-[#3b3b3b]">
            <CardHeader>
              <CardTitle className="text-white">Price Changes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg border-[#3b3b3b]">
                  <div className="text-sm text-muted-foreground text-white">24h</div>
                  <div className="text-lg font-medium mt-1">
                    {formatPercentage(tokenData.market_data.price_change_percentage_24h)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg border-[#3b3b3b]">
                  <div className="text-sm text-muted-foreground text-white">7d</div>
                  <div className="text-lg font-medium mt-1">
                    {formatPercentage(tokenData.market_data.price_change_percentage_7d)}
                  </div>
                </div>
                <div className="p-4 border rounded-lg border-[#3b3b3b]">
                  <div className="text-sm text-muted-foreground text-white">30d</div>
                  <div className="text-lg font-medium mt-1">
                    {formatPercentage(tokenData.market_data.price_change_percentage_30d)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}