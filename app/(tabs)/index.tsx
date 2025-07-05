import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { useAuth } from '@/contexts/authContext'
import React from 'react'
import { StyleSheet } from 'react-native'

const Home = () => {
    const {user} = useAuth();

  return (
    <ScreenWrapper>
        <Typo>Home</Typo>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({})