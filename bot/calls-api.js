import supabase from './supab.js'
import 'dotenv/config'

const botToken=process.env.BOT_TOKEN
const user_first_Name = "Anonymous"

export async function fetchTasks() {
    const {data} = await supabase.from("sponsors").select("*")
    return data
}

export async function checkMember(channelUsername, ID) {
    try {
    let formattedChatId = channelUsername
    if (
        !channelUsername.startsWith('@') &&
        !channelUsername.startsWith('-100')
    ) {
        formattedChatId = `@${channelUsername}`
    }
    const url = `https://api.telegram.org/bot${botToken}/getChatMember` +
                `?chat_id=${formattedChatId}` +
                `&user_id=${ID}`

    const response = await fetch(url)
    if (!response.ok) {
        const errorText = await response.text()
        const json = JSON.parse(errorText)

        console.log( { error: `Telegram API error: ${response.status} ${errorText}` } )
        if (json.error_code === 400
        && json.description.includes('member list is inaccessible')) {
            return null  // signal “skip this sponsor”
        }
        }

        const data = await response.json()
        if (!data.ok) {
            console.log({ error: `Telegram API returned false: ${JSON.stringify(data)}` })
        return false
        }
        const status = data.result.status
        const isMember = ['creator', 'administrator', 'member'].includes(status)
        console.log(isMember? "Success! The person is in the sponsors channel" : "You have to subcribe to the sponsor: " + `${channelUsername}`)
        return isMember
    } catch (err) {
        console.error('Error checking channel membership:', err)
        console.log({ error: `Failed to check channel membership: ${err.message}` })
        return false
    }
}

export async function getOrCreateUser() {
    const potentialUser = await supabase.from("users").select().eq("telegram", MY_ID)

    if(potentialUser.data.length !== 0) {
        return potentialUser.data[0]
    }
    
    const newUser = {
        telegram: MY_ID,
        friends: {},
        tasks: {},
        score: 0,
        spins: 1,
        timestamp: null,
        wins: {},
        first_Name: user_first_Name,
        play_timestamp: null,
        play_ready: true,
    }

    await supabase.from('users').insert(newUser)
    return newUser
}

export async function registerRef(userName, refId) {
    const {data} = await supabase.from("users").select().eq('telegram', +refId)

    const refUser = data[0]

    await supabase.from('users').update({
        friends: { ... refUser.friends, [MY_ID]: userName },
        spins: refUser.spins + 1,
    }).eq('telegram', +refId)
}

export async function completeTask(user, task) {
    const score = useScoreStore()
    const newScore = score.score + task.amount
    score.setScore(newScore)

    await supabase.from('users').update({
        tasks: { ... user.tasks, [task.id]: true},
        score: newScore,
    }).eq('telegram', MY_ID)
}