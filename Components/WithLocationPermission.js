import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Platform,
  Linking,
} from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const withLocationPermission = (WrappedComponent) => {
  return (props) => {
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
      checkLocationPermission();
    }, []);

    const checkLocationPermission = async () => {
      const permissionType =
        Platform.OS === 'android'
          ? PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

      const result = await check(permissionType);

      if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
        setShowModal(true); // show modal
      } else if (result !== RESULTS.GRANTED) {
        const requested = await request(permissionType);
        if (requested !== RESULTS.GRANTED) {
          setShowModal(true); // show modal again
        }
      }
    };

    const handleCancel = () => {
      setShowModal(false);
      BackHandler.exitApp(); // Exit app
    };

    const handleOpenSettings = () => {
      setShowModal(false);
      Linking.openSettings();
    };

    return (
      <>
        <WrappedComponent {...props} />
        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modalContent}>
              <Text style={styles.title}>Location Permission Required</Text>
              <Text style={styles.message}>
                This App requires location access to work properly. Please enable it in settings.
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleOpenSettings} style={styles.settingsButton}>
                  <Text style={styles.buttonText}>Open Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#D71828',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    color: '#444',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    flex: 1,
    borderRadius: 5,
    marginRight: 5,
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: '#D71828',
    padding: 10,
    flex: 1,
    borderRadius: 5,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default withLocationPermission;
