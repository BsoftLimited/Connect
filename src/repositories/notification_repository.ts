import { DBManager } from "../config";
import { type NotifcationType, type Notification } from "../common";
import { Dual } from "../utils/util";

class NotificationsRepository{
    database = DBManager.instance();

    all = async(userID: string): Promise<Notification[]> => {
        const results = await this.database.notification.findMany({ where: { receiverID: userID } });

        return results.map((init)=>{
            return { ...init, ntype: (init.ntype as NotifcationType) ?? "info" };
        });
    }

    get = async(userID: string, id: string): Promise<Dual<Notification, { message: string, status: number }>> => {
        const result= await this.database.notification.findUnique({ where: { id } });
        if(result){
            if(result.receiverID === userID){
                return Dual.first({ ...result, ntype: (result.ntype as NotifcationType) ?? "info" });
            }
           return Dual.second({ message: `user is not allowed to view this notification`, status: 401 });
        }
        return Dual.second({ message: `notification with id: ${id} not found`, status: 404 });
    }

    add = async(userID: string, message: string, ntype: NotifcationType): Promise<Notification> => {
        const result= await this.database.notification.create({ 
            data: { message, ntype, receiverID: userID }
        });

        return { ...result, ntype: (result.ntype as NotifcationType) ?? "info" };
    }

    delete = async(userID: string, id: string): Promise<Dual<Notification, { message: string, status: number }>> => {
        const result= await this.database.notification.delete({ where: { id, receiverID: userID } });
        if(result){
            return Dual.first({ ...result, ntype: (result.ntype as NotifcationType) ?? "info" });
        }
        return Dual.second({ message: `notification with id: ${id} not found`, status: 404 });
    }

    seen = async(userID: string, id: string): Promise<Dual<Notification, { message: string, status: number }>> => {
        const result= await this.database.notification.update({ 
            where: { id, receiverID: userID },
            data: { seen: true }
        });
        
        if(result){
            return Dual.first({ ...result, ntype: (result.ntype as NotifcationType) ?? "info" });
        }
        return Dual.second({ message: `notification with id: ${id} not found`, status: 404 });
    }
}

export { NotificationsRepository };