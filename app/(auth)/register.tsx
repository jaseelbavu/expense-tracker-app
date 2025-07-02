import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import * as Icon from 'phosphor-react-native'
import React, { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'

const Register = () => {
    const router = useRouter();
    const emailRef = useRef('');
    const passwordRef = useRef('');
    const nameRef = useRef('');
    const {register: registerUser} = useAuth();

    const handleSubmit  =  async () => {
        if(!emailRef.current || !passwordRef.current || !nameRef.current) {
            Alert.alert('Sign Up', 'Please fill all the fields');
            return;
        }
        
        setIsLoading(true);

        const res = await registerUser(
            emailRef.current,
            passwordRef.current,
            nameRef.current
        );

        setIsLoading(false);

        if(!res.success) {
            Alert.alert('Sign Up:', res.msg)
        }
    }

    const [isLoading, setIsLoading] = useState(false);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
            <Typo size={30} fontWeight={"800"}>
                Let's,
            </Typo>
            <Typo size={30} fontWeight={"800"}>
                Get Started
            </Typo>
        </View>

        <View style={styles.form}>
            <Typo size={16} color={colors.textLight}>
                Create an account to track your expenses
            </Typo>

            <Input placeholder='Enter your name' onChangeText={(value) => (nameRef.current = value)}
                icon={<Icon.UserIcon size={verticalScale(26)} color={colors.neutral300} weight='fill' />} />

            <Input placeholder='Enter your email' onChangeText={(value) => (emailRef.current = value)}
                icon={<Icon.AtIcon size={verticalScale(26)} color={colors.neutral300} weight='fill' />} />

            <Input placeholder='Enter your password' onChangeText={(value) => (passwordRef.current = value)} secureTextEntry
                icon={<Icon.LockIcon size={verticalScale(26)} color={colors.neutral300} weight='fill' />} />

            <Button onPress={handleSubmit} loading={isLoading}>
                <Typo fontWeight={"700"} color={colors.black} size={21}>
                    Sign Up
                </Typo>
            </Button>
        </View>

        <View style={styles.footer}>
            <Typo size={15}>Already have an account?</Typo>
            <Pressable onPress={() => router.navigate('/(auth)/login')}>
                <Typo size={15} fontWeight={"700"} color={colors.primary}>Login</Typo>
            </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Register

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: spacingY._30,
        paddingHorizontal: spacingX._20
    },
    welcomeText: {
        fontSize: verticalScale(20),
        fontWeight: 'bold',
        color: colors.text
    },
    form: {
        gap: spacingY._20
    },
    forgotPassword: {
        textAlign: 'right',
        fontWeight: 'bold',
        color: colors.text
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5
    },
    footerText: {
        fontSize: verticalScale(15),
        textAlign: 'center',
        color: colors.text
    }
})