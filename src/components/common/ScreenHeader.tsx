import { View, Text, Image, StyleSheet } from "react-native";

interface Props {

    title: string;

    subtitle: string;

}

export default function ScreenHeader({
    title,
    subtitle,
}: Props) {

    return (

        <View>

            <Image

                source={require("../../assets/images/healthnexus-logo.png")}

                style={styles.logo}

            />

            <Text style={styles.title}>
                {title}
            </Text>

            <Text style={styles.subtitle}>
                {subtitle}
            </Text>

        </View>

    );

}

const styles = StyleSheet.create({

    logo: {

        width: 110,

        height: 110,

        alignSelf: "center",

        marginBottom: 15,

    },

    title: {

        fontSize: 32,

        fontWeight: "bold",

        textAlign: "center",

    },

    subtitle: {

        textAlign: "center",

        color: "gray",

        marginBottom: 30,

    },

});