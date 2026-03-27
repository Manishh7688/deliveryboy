import Toast from 'react-native-toast-message'

const ShowToast = (message,type='success')=>{
    Toast.show({
        type,
        text1,
        position:'top',
        visibilityTime:3000,
        autoHide:true
    })
}

export default ShowToast