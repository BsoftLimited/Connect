import { config } from "process";
import type { SiteConfig } from "../common";
import { DBManager } from "../config";

class ConfigRepository {
    database = DBManager.instance();

    get = async(): Promise<SiteConfig> => {
        const config = await this.database.siteConfig.findFirst();
        if(config){
            return { ...config,  };
        }
        throw new Error("Site configuration not found");
    }

    create = async(adminID: string): Promise<SiteConfig> => {
        const config = await this.database.siteConfig.create({
            data: { adminID },
        });
        return { ...config,  };
    }

    update = async(configID: string, data: Partial<SiteConfig>): Promise<SiteConfig> => {
        const config = await this.database.siteConfig.update({
            where: { id: configID },
            data: { ...data },
        });
        return { ...config,  };
    }
}

export default ConfigRepository;