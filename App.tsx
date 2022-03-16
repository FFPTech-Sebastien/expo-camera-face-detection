import {Dimensions, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Camera} from 'expo-camera';
import * as FaceDetector from 'expo-face-detector';
import {Face} from "expo-camera/build/Camera.types";
import {useEffect, useRef, useState} from "react";
import Canvas, {CanvasRenderingContext2D} from "react-native-canvas";

const {width, height} = Dimensions.get('window');

enum BoundingBoxType {
    INTERNAL,
    EXTERNAL,
    BOTH
}

export default function App() {
    const [boundingBox, setBoundingBox] = useState<BoundingBoxType>(BoundingBoxType.EXTERNAL);
    const internalCanvas = useRef<Canvas>();
    const externalCanvas = useRef<Canvas>();
    const externalContext = useRef<CanvasRenderingContext2D>();
    const internalContext = useRef<CanvasRenderingContext2D>();

    useEffect(() => {
        (async () => {
            await Camera.requestCameraPermissionsAsync();
        })();
    }, [])

    const handleExternalCanvas = (can: Canvas) => {
        if (can) {
            can.width = width;
            can.height = height;
            const ctx: CanvasRenderingContext2D = can.getContext('2d');
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 3;

            externalContext.current = ctx;
            externalCanvas.current = can;
        }
    }

    const handleInternalCanvas = (can: Canvas) => {
        if (can) {
            can.width = width;
            can.height = height;
            const ctx: CanvasRenderingContext2D = can.getContext('2d');
            ctx.strokeStyle = 'blue';
            ctx.fillStyle = "blue";
            ctx.lineWidth = 3;

            internalContext.current = ctx;
            internalCanvas.current = can;
        }
    }

    const drawInner = (face: Face) => {
        const {
            leftEyePosition,
            leftCheekPosition,
            leftMouthPosition,
            leftEarPosition,
            rightEyePosition,
            rightMouthPosition,
            rightCheekPosition,
            rightEarPosition,
            noseBasePosition
        } = face;
        internalContext.current?.beginPath();
        internalContext.current?.arc(leftEyePosition.x, leftEyePosition.y, 5, 0, 2 * Math.PI);
        internalContext.current?.moveTo(leftEarPosition.x, leftEarPosition.y);
        internalContext.current?.arc(leftEarPosition.x, leftEarPosition.y, 5, 0, 2 * Math.PI);
        internalContext.current?.moveTo(leftCheekPosition.x, leftCheekPosition.y);
        internalContext.current?.arc(leftCheekPosition.x, leftCheekPosition.y, 5, 0, 2 * Math.PI);
        internalContext.current?.moveTo(leftMouthPosition.x, leftMouthPosition.y);
        internalContext.current?.arc(leftMouthPosition.x, leftMouthPosition.y, 5, 0, 2 * Math.PI);
        internalContext.current?.moveTo(rightEarPosition.x, rightEarPosition.y);
        internalContext.current?.arc(rightEarPosition.x, rightEarPosition.y, 5, 0, 2 * Math.PI);
        internalContext.current?.moveTo(rightEyePosition.x, rightEyePosition.y);
        internalContext.current?.arc(rightEyePosition.x, rightEyePosition.y, 5, 0, 2 * Math.PI);
        internalContext.current?.moveTo(rightCheekPosition.x, rightCheekPosition.y);
        internalContext.current?.arc(rightCheekPosition.x, rightCheekPosition.y, 5, 0, 2 * Math.PI);
        internalContext.current?.moveTo(rightMouthPosition.x, rightMouthPosition.y);
        internalContext.current?.arc(rightMouthPosition.x, rightMouthPosition.y, 5, 0, 2 * Math.PI);
        internalContext.current?.moveTo(noseBasePosition.x, noseBasePosition.y);
        internalContext.current?.arc(noseBasePosition.x, noseBasePosition.y, 5, 0, 2 * Math.PI);
        internalContext.current?.fill();
    }

    const drawOuter = (face: Face) => {
        const {bounds: {origin: {x, y}, size: {width, height}}} = face;
        externalContext.current!.strokeRect(x, y, width, height);
    }

    const handleFacesDetected = ({faces}: { faces: Face[] }) => {
        internalContext?.current?.clearRect(0, 0, width, height);
        externalContext?.current?.clearRect(0, 0, width, height);
        if (internalContext.current !== undefined && externalContext.current !== undefined) {
            faces.forEach(face => {
                if (boundingBox === BoundingBoxType.EXTERNAL || boundingBox === BoundingBoxType.BOTH) {
                    drawOuter(face);
                }
                if (boundingBox === BoundingBoxType.INTERNAL || boundingBox === BoundingBoxType.BOTH) {
                    drawInner(face);
                }
            });
        }
    }

    return (
        <View style={styles.container}>
            <Camera
                type={Camera.Constants.Type.front}
                style={{width: '100%', height: '100%'}}
                onFacesDetected={handleFacesDetected}
                faceDetectorSettings={{
                    mode: FaceDetector.FaceDetectorMode.accurate,
                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
                    runClassifications: FaceDetector.FaceDetectorClassifications.all,
                    minDetectionInterval: 100,
                    tracking: true,
                }}
            />
            <Canvas ref={handleExternalCanvas} style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                zIndex: 999
            }}/>
            <Canvas ref={handleInternalCanvas} style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                zIndex: 999
            }}/>
            <View style={{
                width: '100%',
                position: 'absolute',
                bottom: '5%',
                zIndex: 9999,
                flexDirection: 'row',
                justifyContent: 'space-around',
            }}>
                <TouchableOpacity
                    style={[styles.button, {
                        backgroundColor: 'red'
                    }]}
                    onPress={() => {
                        setBoundingBox(BoundingBoxType.EXTERNAL);
                    }}>
                    <Text style={{color: 'white'}}>External</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, {
                        backgroundColor: 'blue'
                    }]}
                    onPress={() => {
                        setBoundingBox(BoundingBoxType.INTERNAL);
                    }}>
                    <Text style={{color: 'white'}}>Internal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, {
                        backgroundColor: 'green'
                    }]}
                    onPress={() => {
                        setBoundingBox(BoundingBoxType.BOTH)
                    }}>
                    <Text style={{color: 'white'}}>Both</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    button: {
        padding: 10
    }
});
