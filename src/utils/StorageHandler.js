class StorageHandler {
    constructor(){
        const SCHEMA_VERSION = 1

        const current_version = localStorage.getItem('schema_version')

        if (!current_version || (current_version < SCHEMA_VERSION)){
            //Delete data and recreate storage
        }
    }

    
}

export default new StorageHandler()