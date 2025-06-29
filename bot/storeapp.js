import {
  fetchTasks,
  checkMember,
} from './calls-api.js'

  export async function getAllSponsors() {
    const all = await fetchTasks()
    return all
  }

  export async function fetchTasksBot(ID) {
    // 1) load all sponsors
    const not_done_tasks=[]
    const all = await fetchTasks() // from api/app.js
    const kept = []
    const notDone = []

    for (const sponsor of all) {
      const member = await checkMember(sponsor.shortlink, ID)
      if (member === null) {
        // bot cannot access — drop this one
        console.warn(`Skipping inaccessible: ${sponsor.shortlink}`)
        continue
      }
      kept.push(sponsor)
      notDone.push(member)
    }

    // return true only if there are sponsors and all are “done”
    return notDone.length > 0
        && notDone.every(v => v === true)
  }