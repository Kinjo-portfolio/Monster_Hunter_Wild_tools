//張りぼて画面

import { View, Text } from "react-native"
import { Link, useLocalSearchParams } from "expo-router"

const Placeholder = () => {
    const { title = "このページ" } = useLocalSearchParams()
    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>

            <Text style={{ fontSize: 22, fontWeight: "700" }}>{title}</Text>
            <Text> 準備中 </Text>
            <Link href="/" style={{ textDecorationLine: "underline" }}>← トップへ戻る</Link>

        </View>)
}

export default Placeholder