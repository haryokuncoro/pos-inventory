import { createAccessControl } from "better-auth/plugins/access";

const statement = { 
    users: ["view", "create", "update", "delete"],
    products: ["view", "create", "update", "delete"],
    categories: ["view", "create", "update", "delete"],
    sales: ["view", "create", "update", "delete"],
    sales_reports: ["view"], 
} as const; 

export const ac = createAccessControl(statement); 

export const user = ac.newRole({ 
    sales: ["view", "create", "update", "delete"],
    products: ["view"],
    categories: ["view"],
}); 
export const admin = ac.newRole({ 
    users: ["view", "create", "update", "delete"],
    products: ["view", "create", "update", "delete"],
    categories: ["view", "create", "update", "delete"],
    sales: ["view", "create", "update", "delete"],
    sales_reports: ["view"],
}); 
