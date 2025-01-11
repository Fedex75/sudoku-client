import { DifficultyName, GameModeName } from "./Difficulties"

export type StatisticsItem = {
  average: number
  count: number
  best: number
}

export type GameModeStatistics<Difficulties extends string> = Partial<Record<Difficulties, StatisticsItem>>

export type Statistics<GameModes extends string, Difficulties extends string> = {
  [GameMode in GameModes]: GameModeStatistics<Difficulties>
}

export const defaultStatistics: Statistics<GameModeName, DifficultyName> = {
  classic: {
    easy: {
      average: 0,
      count: 0,
      best: 0
    },
    medium: {
      average: 0,
      count: 0,
      best: 0
    },
    hard: {
      average: 0,
      count: 0,
      best: 0
    },
    expert: {
      average: 0,
      count: 0,
      best: 0
    },
    evil: {
      average: 0,
      count: 0,
      best: 0
    },
    unrated: {
      average: 0,
      count: 0,
      best: 0
    }
  },
  killer: {
    easy: {
      average: 0,
      count: 0,
      best: 0
    },
    medium: {
      average: 0,
      count: 0,
      best: 0
    },
    hard: {
      average: 0,
      count: 0,
      best: 0
    },
    expert: {
      average: 0,
      count: 0,
      best: 0
    },
    evil: {
      average: 0,
      count: 0,
      best: 0
    },
    unrated: {
      average: 0,
      count: 0,
      best: 0
    }
  },
  sudokuX: {
    easy: {
      average: 0,
      count: 0,
      best: 0
    },
    medium: {
      average: 0,
      count: 0,
      best: 0
    },
    hard: {
      average: 0,
      count: 0,
      best: 0
    },
    expert: {
      average: 0,
      count: 0,
      best: 0
    },
    evil: {
      average: 0,
      count: 0,
      best: 0
    },
    unrated: {
      average: 0,
      count: 0,
      best: 0
    }
  },
  sandwich: {
    easy: {
      average: 0,
      count: 0,
      best: 0
    },
    medium: {
      average: 0,
      count: 0,
      best: 0
    },
    hard: {
      average: 0,
      count: 0,
      best: 0
    },
    expert: {
      average: 0,
      count: 0,
      best: 0
    },
    evil: {
      average: 0,
      count: 0,
      best: 0
    },
    unrated: {
      average: 0,
      count: 0,
      best: 0
    }
  },
  thermo: {
    easy: {
      average: 0,
      count: 0,
      best: 0
    },
    medium: {
      average: 0,
      count: 0,
      best: 0
    },
    hard: {
      average: 0,
      count: 0,
      best: 0
    },
    expert: {
      average: 0,
      count: 0,
      best: 0
    },
    evil: {
      average: 0,
      count: 0,
      best: 0
    },
    unrated: {
      average: 0,
      count: 0,
      best: 0
    }
  }
}

export const millisecondsToHMS = (time: number) => {
  const totalHours = Math.floor((time / 3600000) % 60)
  const totalHoursString = totalHours > 0 ? totalHours + ':' : ''
  const paddedMinutes = ('0' + Math.floor((time / 60000) % 60)).slice(-2)
  const paddedSeconds = ('0' + Math.floor((time / 1000) % 60)).slice(-2)
  return `${totalHoursString}${paddedMinutes}:${paddedSeconds}`
}

export const updateStatistic = (stat: StatisticsItem | undefined, newValue: number) => {
  if (stat === undefined) return
  stat.average = (stat.count * stat.average + newValue) / (stat.count + 1)
  stat.count++
  stat.best = (stat.best === 0 || newValue < stat.best) ? newValue : stat.best
}
