import { firestore } from "@/config/firebase";
import { ResponseType, WalletType } from "@/types";
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";

export const createOrUpdateWallet = async (
    walletData: Partial<WalletType>
): Promise<ResponseType> => {
    try {
        let walletToSave = {...walletData};

        if(walletData.image) {
            const imageUploadResponse = await uploadFileToCloudinary(walletData.image, 'wallets');
            
            if(!imageUploadResponse.success) {
                return {success: false, msg: imageUploadResponse.msg || 'Failed to upload wallet icon'}
            }

            walletToSave.image = imageUploadResponse.data;
        }

        if(!walletData?.id) {
            walletToSave.amount = 0;
            walletToSave.totalIncome = 0;
            walletToSave.totalExpenses = 0;
            walletToSave.created = new Date();
        }

        const walletRef = walletData?.id ? doc(firestore, 'wallets', walletData?.id) : doc(collection(firestore, 'wallets'));
        await setDoc(walletRef, walletToSave, {merge: true});

        return {success: true, data: {...walletToSave, id: walletRef?.id}};
    } catch(error: any) {
        console.log('Error creating or updating wallet: ', error);
        return {success: false, msg: error.message};
    }
}

export const deleteWallet = async (walletId: string): Promise<ResponseType> => {
    try {
        const walletRef = doc(firestore, 'wallets', walletId);
        await deleteDoc(walletRef);
        
        return {success: true, msg: 'Wallet deleted successfully'}
    } catch(error: any) {
        console.log('Error deleting wallet ', error);
        return {success: false, msg: error.message};
    }
}