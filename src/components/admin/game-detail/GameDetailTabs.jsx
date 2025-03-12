import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewTab } from './tabs/OverviewTab'
import { BetsTab } from './tabs/BetsTab'
import { WinnersTab } from './tabs/WinnersTab'

export function GameDetailTabs({
  activeTab,
  setActiveTab,
  game,
  betStats,
  winners,
  timeInfo,
  isResultsLoading,
  isWinnersLoading,
  onSetResult,
  onViewUser,
  onSelectNumber,
  selectedNumber
}) {
  return (
    <Card className='md:col-span-2'>
      <CardHeader className='px-6 py-4'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid grid-cols-3'>
            <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
            <TabsTrigger value='bets'>Danh sách cược</TabsTrigger>
            <TabsTrigger value='winners'>Người thắng</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <TabsContent value='overview' className='mt-0'>
          <OverviewTab game={game} betStats={betStats} timeInfo={timeInfo} onSetResult={onSetResult} />
        </TabsContent>

        <TabsContent value='bets' className='mt-0'>
          <BetsTab
            game={game}
            betStats={betStats}
            isLoading={isResultsLoading}
            onViewUser={onViewUser}
            onSelectNumber={onSelectNumber}
            selectedNumber={selectedNumber}
          />
        </TabsContent>

        <TabsContent value='winners' className='mt-0'>
          <WinnersTab game={game} winners={winners} isLoading={isWinnersLoading} onViewUser={onViewUser} />
        </TabsContent>
      </CardContent>
    </Card>
  )
}
