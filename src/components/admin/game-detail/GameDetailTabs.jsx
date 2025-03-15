import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverviewTab } from './tabs/OverviewTab'
import { BetsTab } from './tabs/BetsTab'
import { WinnersTab } from './tabs/WinnersTab'
import { motion } from 'framer-motion'
import { Trophy, List, Users, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
  selectedNumber,
  gameId
}) {
  // Animation variants for tab transitions
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
  }

  return (
    <Card className='md:col-span-2 border-2 shadow-lg overflow-hidden'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <CardHeader className='px-6 py-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-900/50 dark:to-transparent border-b'>
          <TabsList className='grid grid-cols-3 p-1 bg-muted/70 backdrop-blur-sm'>
            <TabsTrigger
              value='overview'
              className='flex items-center gap-2 py-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all'
            >
              <Sparkles className='h-4 w-4' />
              <span>Tổng quan</span>
            </TabsTrigger>

            <TabsTrigger
              value='bets'
              className='flex items-center gap-2 py-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all'
            >
              <List className='h-4 w-4' />
              <span>Danh sách cược</span>
              {betStats.total_bets > 0 && (
                <Badge variant='secondary' className='ml-1 bg-primary/10 text-primary text-xs'>
                  {betStats.total_bets}
                </Badge>
              )}
            </TabsTrigger>

            <TabsTrigger
              value='winners'
              className='flex items-center gap-2 py-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all'
            >
              <Trophy className='h-4 w-4' />
              <span>Người thắng</span>
              {game.status === 'completed' && winners.length > 0 && (
                <Badge
                  variant='secondary'
                  className='ml-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs'
                >
                  {winners.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </CardHeader>

        <CardContent className='p-0 sm:p-6'>
          <motion.div
            key={activeTab}
            initial='hidden'
            animate='visible'
            variants={tabContentVariants}
            className='min-h-[400px]'
          >
            <TabsContent value='overview' className='mt-0 pt-4 px-4 sm:px-0'>
              <OverviewTab game={game} betStats={betStats} timeInfo={timeInfo} onSetResult={onSetResult} />
            </TabsContent>

            <TabsContent value='bets' className='mt-0 pt-4 px-4 sm:px-0'>
              <BetsTab
                game={game}
                gameId={gameId}
                betStats={betStats}
                isLoading={isResultsLoading}
                onViewUser={onViewUser}
                onSelectNumber={onSelectNumber}
                selectedNumber={selectedNumber}
              />
            </TabsContent>

            <TabsContent value='winners' className='mt-0 pt-4 px-4 sm:px-0'>
              <WinnersTab game={game} winners={winners} isLoading={isWinnersLoading} onViewUser={onViewUser} />
            </TabsContent>
          </motion.div>
        </CardContent>
      </Tabs>
    </Card>
  )
}
