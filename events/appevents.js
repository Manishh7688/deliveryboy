import analytics from '@react-native-firebase/analytics'
import crashlytics from '@react-native-firebase/crashlytics'


const appEvents = async({
    eventName="",
    payload={}
})=>{
    try {
        await analytics().logEvent(eventName,payload)
        // Log custom event to Crashlytics for additional context
        crashlytics().log(`Custom event: ${eventName}`)
        console.log(`${eventName} event captured done`)
    } catch (error) {
        console.log('event not captured!')
        // Log the error to Crashlytics
        crashlytics().recordError(error)
    }
}

export default appEvents
