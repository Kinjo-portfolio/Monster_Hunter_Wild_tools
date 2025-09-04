import { Stack, router } from "expo-router"
import { Pressable, View, Text } from "react-native"

const EquipScreen = () => {
    const goBack = () => router.back()

    return (
        <View style={{ flex: 1, padding: 16, gap: 12 }}>

            <Stack.Screen options={{ title: "装備シミュレータ" }}></Stack.Screen>

            <Text style={{ fontSize: 22, fontWeight: 700}}>装備シミュレータwip</Text>

            <Text>ここからUI</Text>

            <Pressable onPress={goBack} style={{ alignSelf: "flex-start", padding: 10, borderWidth: 1, borderRadius: 10 }}>

                <Text>← トップへ戻る</Text>

            </Pressable>

        </View>
    )

}

export default EquipScreen