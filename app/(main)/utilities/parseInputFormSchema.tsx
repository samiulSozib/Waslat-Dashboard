import { CustomField } from "@/types/interface";

// Helper function to parse input_form_schema
export const parseInputFormSchema = (
  schema: string | CustomField[] | null | undefined
): CustomField[] => {
  if (!schema) return [];

  if (Array.isArray(schema)) {
    return schema;
  }

  try {
    let parsed = JSON.parse(schema);

    // If it’s still a string, parse again
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }
    console.log(Array.isArray(parsed))
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error parsing input_form_schema:", error);
    return [];
  }
};


// Helper function to stringify input_form_schema
export const stringifyInputFormSchema = (fields: CustomField[]): string => {
  return JSON.stringify(fields);
};
