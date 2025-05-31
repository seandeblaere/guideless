import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, StatusBar } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { decode } from '@googlemaps/polyline-codec';
import * as Location from 'expo-location';

export default function MapScreen() {
  const encodedPolyline = 'wesvHstuUC}A\\EXItBmAM\\L]j@[GSEUEYEg@Ic@Sg@OMy@sBKQCEKQgA}@DUVw@BIFSBIBSZb@HHJBJEf@p@p@v@j@n@p@wBd@aBV}@ZVNNFBFB@?F?XCFAH@FBDBbAn@Je@`@mCNeABSHAl@h@BBd@`@NRX`@HNZf@DFEGI`@Mp@?@Or@Or@FD@ABW@KDEHE@D@B@@@BNH?J?NBN@J@DT^Cd@Gd@Eb@Eb@MhACVATEp@?x@?`A?Z@Z?V@h@@Z?R@L?L?HI@A@?@?@?@?B@F?DE??AA??EAA?C?A?E@W]@SBWBO@C@MBC@IBGDC@I?K?EAQAKCJBaAjEELCLOPCDEH@JDZHV@Br@jAJLPRPRd@n@JVLXCFAPAd@EfAAVNGn@ILBVCH?B?~CUDGrAMBJAGDAbAMJAH?ZCFC~@ILC|@ETBtCMF?jAIHENEj@f@FAPHHBL?t@QFD~Cw@z@UHC^IJ?lCi@H@Bi@CqB@OA[?Q^Ab@CZAL?BbBExBChAStBr@n@RLDDXTHFHNF?ZNv@d@LHnA|@FY?ED[`@mCVwARyBBYHBlBf@PFPDdAVF@XFD@F@D@BIVq@JS@EDG?APa@DI@EH]DKLSBIHYTi@NSFQDQPc@BGLEFQ@CJe@Pa@HQJWd@eATg@Pa@JSDIJQH]h@cALYHO@C@ERa@DMNWJULKh@oAv@gBFQFO@QBGgCoDQWYe@qAoB[c@CFGECA?a@?QGAQAEAAiD?MoAA_CGKIkCGAFG`AAZoAe@MEiAc@]IOCgBUOEkDq@ICQEMAUEMAoDi@I?c@GG?CASAQAKAEAQAONAqC@pCG?E@K@gATa@HSBMDYJiAp@IFYHm@P{@VMCo@RGBIDIBGBC@AP@\\BTJr@Lz@Dx@h@?LEJDDDDF@J@\\HhBFtA@`@FvA@v@@~@BPHrBJjCANEBEBI@yAAWEICI?AMuAEk@CIAk@Iw@Wa@Ye@c@[Sg@So@M';

  const [myLocation, setMyLocation] = useState<{latitude: number, longitude: number} | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync();
      setMyLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    };
    getLocation();
  }, []);
  

  const initialLocation = {
    latitude: 51.057567,
    longitude: 3.720600,
  };

  const decodedPolyline = decode(encodedPolyline, 5);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      <View style={styles.container}>     
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: initialLocation.latitude,
            longitude: initialLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          provider={PROVIDER_GOOGLE}
          mapType="hybrid"
        >
          <Polyline
            coordinates={decodedPolyline.map(([latitude, longitude]) => ({
              latitude,
              longitude,
            }))}
            strokeColor="#FFF"
            strokeWidth={4}
          />
          {myLocation && (
            <Marker
              coordinate={myLocation}
              title="My Location"
              description="This is my current location"
            />
          )}
        </MapView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  errorContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  errorText: {
    color: 'white',
    fontSize: 12,
  },
  statusContainer: {
    position: 'absolute',
    bottom: 50,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
  },
});