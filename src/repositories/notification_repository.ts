import { DBManager } from "../config";
import { type NotifcationType, type Notification } from "../common";

class NotificationsRepository{
    database = DBManager.instance();

    all = async(userID: string): Promise<Notification[]> => {
        const results = await this.database.notification.findMany({ where: { receiverID: userID } });

        return results.map((init)=>{
            return { ...init, ntype: (init.ntype as NotifcationType) ?? "info" };
        });
    }

    get = async(userID: string, id: string): Promise<Notification> => {
        const result= await this.database.notification.findUnique({ where: { id } });
        if(result){
            if(result.receiverID === userID){
                return { ...result, ntype: (result.ntype as NotifcationType) ?? "info" };
            }
            throw new Error(`user is not allowed to view this notification`);
        }
        throw new Error(`notification with id: ${id} not found`);
    }

    add = async(userID: string, message: string, ntype: NotifcationType): Promise<Notification> => {
        const result= await this.database.notification.create({ 
            data: { message, ntype, receiverID: userID }
        });

        return { ...result, ntype: (result.ntype as NotifcationType) ?? "info" };
    }

    delete = async(userID: string, id: string): Promise<Notification> => {
        const result= await this.database.notification.delete({ where: { id } });
        if(result){
            if(result.receiverID === userID){
                return { ...result, ntype: (result.ntype as NotifcationType) ?? "info" };
            }
            throw new Error(`user is not allowed to view this notification`);
        }
        throw new Error(`notification with id: ${id} not found`);
    }
}