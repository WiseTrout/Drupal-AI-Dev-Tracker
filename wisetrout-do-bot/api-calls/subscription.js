import { oAuthToken } from "../oauth.js";

export async function subscribe(chatId, modules){

    // const body = JSON.stringify({
    //     chatId,
    //     modules
    // })

    // fetch(process.env.BASE_URL + '/api/telegram/subscribe', {
    //     method: 'POST',
    //     headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${oAuthToken}`
    //            },
    //     body: body
    // })
}

export async function unsubscribe(chatId){}

export async function checkSubscription(chatId){
    await wait(2000);
    return null;
}

export async function wipeoutData(chatId){}

// Imitation of server request taking time
async function wait(ms){
    return await new Promise((res, rej) => {
        setTimeout(() => res(), ms)
    })
}