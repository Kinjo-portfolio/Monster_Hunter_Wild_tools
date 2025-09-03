import { Stack } from "expo-router";
// console.log("[_layout] loaded")

const Layout = () => {
    // console.log("[_layout] render")
    return (
        <Stack screenOptions={{ headerTitle: "MonsterHunterWilds", headerShadowVisible: false }} />

    )
}

export default Layout