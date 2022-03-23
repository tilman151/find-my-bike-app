const toQueryString = (obj) => {
    const bike = obj.bike ? `bike=${obj.bike}` : "";
    const frame = obj.frame ? `&frame=${obj.frame}` : "";
    const color = obj.color ? `&color=${obj.color}` : "";
    const skip = obj.skip ? `&skip=${obj.skip}` : "";
    const limit = obj.limit ? `&limit=${obj.limit}` : "";
    return bike + frame + color + skip + limit
}


export const apiGet = async (endpoint, query) => {
    const headers = {access_token: process.env.REACT_APP_API_KEY}
    const queryString = toQueryString(query)
    const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/${endpoint}?${queryString}`
    return await fetch(backendUrl, {headers})
}


export const apiPost = async (endpoint, payload) => {
    const headers = {
        access_token: process.env.REACT_APP_API_KEY, "Content-Type": "application/json"
    }
    const backendUrl = `${process.env.REACT_APP_BACKEND_URL}/${endpoint}`
    return await fetch(backendUrl, {
        method: "POST", headers: headers, body: JSON.stringify(payload)
    })
}