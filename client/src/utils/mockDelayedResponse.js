const mockDelayedResponse = (cb = () => { }, timeout) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve(cb)
        }, timeout);
    })
}

export default mockDelayedResponse