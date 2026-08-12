import { createAccessControl } from "better-auth/plugins/access";

const statement = { 
    user: ["view", "create", "update", "delete"],
    product: ["view", "create", "update", "delete"],
    category: ["view", "create", "update", "delete"],
    sales: ["view", "create", "update", "delete"],
    sales_reports: ["view"], 
} as const; 

export const ac = createAccessControl(statement); 

export const user = ac.newRole({ 
    sales: ["view", "create", "update", "delete"],
    product: ["view"],
    category: ["view"],
}); 
export const admin = ac.newRole({ 
    user: ["view", "create", "update", "delete"],
    product: ["view", "create", "update", "delete"],
    category: ["view", "create", "update", "delete"],
    sales: ["view", "create", "update", "delete"],
    sales_reports: ["view"],
}); 
