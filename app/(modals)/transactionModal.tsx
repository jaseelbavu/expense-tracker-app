import BackButton from '@/components/BackButton'
import Button from '@/components/Button'
import Header from '@/components/Header'
import ImageUpload from '@/components/ImageUpload'
import Input from '@/components/Input'
import ModalWrapper from '@/components/ModalWrapper'
import Typo from '@/components/Typo'
import { expenseCategories, transactionTypes } from '@/constants/data'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { createOrUpdateTransaction, deleteTransaction } from '@/services/transactionService'
import { TransactionType, WalletType } from '@/types'
import { scale, verticalScale } from '@/utils/styling'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { orderBy, where } from 'firebase/firestore'
import * as Icons from 'phosphor-react-native'
import React, { useEffect, useState } from 'react'
import { Alert, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Dropdown } from 'react-native-element-dropdown'


const TransactionModal = () => {
    const {user} = useAuth();
    const [transaction, setTransaction] =  useState<TransactionType>({
        type: 'expense',
        amount: 0,
        description: '',
        category: '',
        date: new Date(),
        walletId: '',
        image: null
    });

    const [isLoading, setIsLoading] =   useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const router = useRouter();

    type paramType = { 
        id: string,
        type: string,
        amount: number,
        category?: string,
        date: string,
        description?: string,
        image?: string, 
        uid?: string,
        walletId: string,
    };
    const oldTransaction: paramType  = useLocalSearchParams();

    useEffect(() => {
        if(oldTransaction?.id) {
            setTransaction({
                type: oldTransaction?.type,
                amount: Number(oldTransaction.amount),
                category: oldTransaction.category || '',
                date: new Date(oldTransaction.date),
                description: oldTransaction.description || '',
                image: oldTransaction?.image,
                walletId: oldTransaction.walletId,
            })
        }
    }, [])

    const onSubmit = async () => {
        const {type, amount, description, category, date, walletId, image} = transaction;

        if(!walletId || !date || !amount || (type == 'expense' && !category)) {
            Alert.alert('Transaction', 'Please fill all the fields');
            return;
        }

        let transactionData: TransactionType = {
            type, amount, description, category, date, walletId, image: image ? image : null, uid: user?.uid
        };

        if(oldTransaction?.id) transactionData.id = oldTransaction.id;
        
        setIsLoading(true);
        const res = await createOrUpdateTransaction(transactionData);
        setIsLoading(false);

        if(res.success) {
            router.back();
        } else {
            Alert.alert('Transaction', res.msg);
        }
    }

    const onDelete = async () => {
        if(!oldTransaction?.id) return;
        setIsLoading(true);
        const res = await deleteTransaction(oldTransaction?.id, oldTransaction.walletId);
        setIsLoading(false);

        if(res.success) {
            router.back();
        } else {
            Alert.alert('Transaction', res.msg);
        }
    }

    const showDeleteAlert = () => {
        Alert.alert('Confirm', 'Are you sure to delete this transaction?', [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel delete'),
                style: 'cancel'
            },
            {
                text: 'Delete',
                onPress: () => onDelete(),
                style: 'destructive'
            }
        ])
    }
    
    const {
        data: wallets,
        loading: walletLoading,
        error: walletError
    } = useFetchData<WalletType>('wallets', [
        where('uid', '==', user?.uid),
        orderBy('created', 'desc')
    ]);

    const onDateChange = (event: any, selectedDate: any) => {
        const currentDate = selectedDate || transaction.date;
        setTransaction({...transaction, date: currentDate});
        setShowDatePicker(Platform.OS == 'ios' ? true : false);
    }
    
  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header title={oldTransaction?.id ? `Update Transaction: ${oldTransaction?.type}` : 'New Transaction'} leftIcon={<BackButton />} style={{marginBottom: spacingY._10}} />

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Transaction Type</Typo>
                <Dropdown
                    style={styles.dropdownContainer}
                    // placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText}
                    iconStyle={styles.dropdownIcon}
                    itemTextStyle={styles.dropdownItemText}
                    containerStyle={styles.dropdownListContainer}
                    itemContainerStyle={styles.dropdownItemContainer}
                    activeColor={colors.neutral700}
                    data={transactionTypes}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    // placeholder={!isFocus ? 'Select item' : '...'}
                    value={transaction.type}
                    onChange={item => {
                        setTransaction({...transaction, type: item.value});
                    }}
                />
            </View>

            <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Wallet</Typo>
                <Dropdown
                    style={styles.dropdownContainer}
                    placeholderStyle={styles.dropdownPlaceholder}
                    selectedTextStyle={styles.dropdownSelectedText}
                    iconStyle={styles.dropdownIcon}
                    itemTextStyle={styles.dropdownItemText}
                    containerStyle={styles.dropdownListContainer}
                    itemContainerStyle={styles.dropdownItemContainer}
                    activeColor={colors.neutral700}
                    data={wallets.map(wallet => ({
                        label: `${wallet?.name} ($${wallet?.amount})`,
                        value: wallet?.id
                    }))}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder='Select item'
                    value={transaction.walletId}
                    onChange={item => {
                        setTransaction({...transaction, walletId: item.value || ''});
                    }}
                />
            </View>

            {transaction.type == 'expense' && (
                <View style={styles.inputContainer}>
                    <Typo color={colors.neutral200} size={16}>Expense Category</Typo>
                    <Dropdown
                        style={styles.dropdownContainer}
                        placeholderStyle={styles.dropdownPlaceholder}
                        selectedTextStyle={styles.dropdownSelectedText}
                        iconStyle={styles.dropdownIcon}
                        itemTextStyle={styles.dropdownItemText}
                        containerStyle={styles.dropdownListContainer}
                        itemContainerStyle={styles.dropdownItemContainer}
                        activeColor={colors.neutral700}
                        data={Object.values(expenseCategories)}
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder='Select item'
                        value={transaction.category}
                        onChange={item => {
                            setTransaction({...transaction, category: item.value || ''});
                        }}
                    />
                </View>
            )}

            <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Transaction Date</Typo>
                {!showDatePicker && (
                    <Pressable style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
                        <Typo size={14}>{(transaction.date as Date).toLocaleDateString()}</Typo>
                    </Pressable>
                )}

                {showDatePicker && (
                    <View style={Platform.OS == 'ios' && styles.iosDatePicker}>
                        <DateTimePicker themeVariant='dark' value={transaction.date as Date}
                            textColor={colors.white} mode='date' display={Platform.OS == 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />
                        
                        {Platform.OS == 'ios' && (
                            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(false)}>
                                <Typo size={15} fontWeight={"500"}>APPLY</Typo>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.inputContainer}>
                <Typo color={colors.neutral200} size={16}>Transaction Amount</Typo>
                <Input value={transaction.amount?.toString()} keyboardType='numeric'
                    onChangeText={(value) => setTransaction({...transaction, amount: Number(value.replace(/[^0-9]/g, ""))})} />
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.flexRow}>
                    <Typo color={colors.neutral200} size={16}>Description</Typo>
                    <Typo color={colors.neutral500} size={14}>(Optional)</Typo>
                </View>
                <Input value={transaction.description} multiline 
                    containerStyle={{
                        flexDirection: 'row',
                        height: verticalScale(100),
                        alignItems: 'flex-start',
                        paddingVertical: 15
                    }}
                    onChangeText={(value) => setTransaction({...transaction, description: value})} />
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.flexRow}>
                    <Typo color={colors.neutral200} size={16}>Receipt</Typo>
                    <Typo color={colors.neutral200} size={14}>(Optional)</Typo>
                </View>
                <ImageUpload file={transaction.image} onClear={() => setTransaction({...transaction, image: null})} onSelect={(file) => setTransaction({...transaction, image: file})} />
            </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        {oldTransaction?.id && !isLoading && (
            <Button style={{backgroundColor: colors.rose, paddingHorizontal: spacingX._15}} onPress={showDeleteAlert}>
                <Icons.TrashIcon color={colors.white} size={verticalScale(24)} weight='bold' />
            </Button>
        )}
        <Button onPress={onSubmit} loading={isLoading} style={{flex: 1}}>
            <Typo color={colors.black} fontWeight={"700"}>
                {
                    oldTransaction?.id ? 'Update Transaction' : 'Add Transaction'
                }
            </Typo>
        </Button> 
      </View>
    </ModalWrapper>
  )
}

export default TransactionModal

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingY._20
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacingX._20,
        gap: scale(12),
        paddingTop: spacingY._15,
        borderTopColor: colors.neutral700,
        marginBottom: spacingY._15,
        borderTopWidth: 1,
    },
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15
    },
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacingX._5
    },
    dateInput: {
        flexDirection: 'row',
        height: verticalScale(54),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.neutral300,
        borderRadius: radius._17,
        borderCurve: 'continuous',
        paddingHorizontal: spacingX._15
    },
    iosDatePicker: {},
    datePickerButton: {
        backgroundColor: colors.neutral700,
        alignSelf: 'flex-end',
        padding: spacingY._7,
        marginRight: spacingX._7,
        paddingHorizontal: spacingY._15,
        borderRadius: radius._10
    },
    dropdownContainer: {
        height: verticalScale(54),
        borderWidth: 1,
        borderColor: colors.neutral300,
        borderRadius: radius._15,
        borderCurve: 'continuous',
        paddingHorizontal: spacingX._15
    },
    dropdownItemText: {
        color: colors.white
    },
    dropdownSelectedText: {
        color: colors.white,
        fontSize: verticalScale(14)
    },
    dropdownListContainer: {
        backgroundColor: colors.neutral900,
        borderRadius: radius._15,
        borderCurve: 'continuous',
        paddingHorizontal: spacingY._7,
        top: 5,
        borderColor: colors.neutral500,
        shadowColor: colors.black,
        shadowOffset: {width: 0, height: 5},
        shadowRadius: 15,
        shadowOpacity: 1,
        elevation: 5
    },
    dropdownPlaceholder: {
        color: colors.white
    },
    dropdownItemContainer: {
        borderRadius: radius._15,
        marginHorizontal: spacingX._7
    },
    dropdownIcon: {
        height: verticalScale(30),
        tintColor: colors.neutral300
    },
    avatarContainer: {
        position: 'relative',
        alignSelf: 'center'
    },
    avatar: {
        alignSelf: 'center',
        backgroundColor: colors.neutral300,
        height: verticalScale(135),
        width: verticalScale(135),
        borderRadius: 200,
        borderWidth: 1,
        borderColor: colors.neutral500
    },
    editIcon: {
        position: 'absolute',
        bottom: spacingY._5,
        right: spacingY._7,
        borderRadius: 50,
        backgroundColor: colors.neutral100,
        shadowColor: colors.black,
        shadowOffset: {height: 0, width: 0},
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        padding: spacingY._7
    },
    inputContainer: {
        gap: spacingY._10
    },
})