export function generateNums(maxValue: number) {
  const values: number[] = []
  for (let i=1; i <= maxValue; i++) {
    values.push(i)
  }
  return values
}

export function shuffle<T>(array: T[]) {
  const arrayCopy = [...array]
  for(let i = arrayCopy.length-1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i+1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]]
  }
  return arrayCopy
}

export function selectRandomUsers<T>(count: number=1, array: T[]) {
  const shuffledArray = shuffle(array)
  return shuffledArray.slice(0, count)
}

export function generateGroups<T>(members: T[], groupCount: number) {
  const maxGroupSize = Math.floor(members.length / groupCount)
  const remainder = members.length % groupCount
  const groups:T[][] = []
  const shuffledMembers = shuffle(members)


  for (let i=0; i < groupCount; i++) {
    const group: T[] = []
    if (i<remainder) {
      for(let j=0; j < maxGroupSize+1; j++) {
        if(shuffledMembers.length === 0) {
          groups.push(group)
          return groups
        }
        group.push(shuffledMembers.pop()!)
      }
    } else {
      for(let j=0; j < maxGroupSize; j++) {
        if(shuffledMembers.length === 0) {
          groups.push(group)
          return groups
        }
        group.push(shuffledMembers.pop()!)
      }
    }
    groups.push(group)
  }
  return groups
}
