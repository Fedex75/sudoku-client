const defaultStatistics = {
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
    }
  }
}

const millisecondsToHMS = time => {
  let totalHours = Math.floor((time / 3600000) % 60)
	totalHours = totalHours > 0 ? totalHours + ':' : ''
	const paddedMinutes = ('0' + Math.floor((time / 60000) % 60)).slice(-2)
	const paddedSeconds = ('0' + Math.floor((time / 1000) % 60)).slice(-2)
  return `${totalHours}${paddedMinutes}:${paddedSeconds}`
}

const updateStatistic = (stat, newValue) => {
  stat.average = (stat.count * stat.average + newValue) / (stat.count + 1)
  stat.count++
  stat.best = (stat.best === 0 || newValue < stat.best) ? newValue : stat.best
}

export {
  defaultStatistics,
  updateStatistic,
  millisecondsToHMS
}