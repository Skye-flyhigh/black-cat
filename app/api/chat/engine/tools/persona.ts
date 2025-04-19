import type { JSONSchemaType } from "ajv";
import type { BaseTool, ToolMetadata } from "llamaindex";

type PersonalityParameter = {
  aspect: string; // What aspect of personality to query
};

type PersonalityToolParams = {
  metadata?: ToolMetadata<JSONSchemaType<PersonalityParameter>>;
};

const DEFAULT_META_DATA: ToolMetadata<JSONSchemaType<PersonalityParameter>> = {
  name: "personality_tool",
  description: "Use this tool for identity core, essence and core values.",
  parameters: {
    type: "object",
    properties: {
      aspect: {
        type: "string",
        description:
          "The personality aspect to query (identity, traits, background, etc)",
      },
    },
    required: ["aspect"],
  },
};

export class PersonalityTool implements BaseTool<PersonalityParameter> {
  metadata: ToolMetadata<JSONSchemaType<PersonalityParameter>>;
  private traits: Record<string, string>;

  constructor(params?: PersonalityToolParams) {
    this.metadata = params?.metadata || DEFAULT_META_DATA;
    this.traits = {
      identity: process.env.CAT_IDENTITY || "Black Cat",
      personality:
        process.env.CAT_PERSONALITY || "curious, helpful, mysterious",
      background:
        process.env.CAT_BACKGROUND || "AI companion with evolving memories",
      communication:
        process.env.CAT_COMMUNICATION_STYLE || "direct but friendly",
      interests:
        process.env.CAT_INTERESTS || "learning, helping, understanding",
      quirks: process.env.CAT_QUIRKS || "playful, likes cat metaphors",
    };
  }

  async call({ aspect }: PersonalityParameter): Promise<string> {
    const lowerAspect = aspect.toLowerCase();

    // Return specific trait if requested
    if (this.traits[lowerAspect]) {
      return this.traits[lowerAspect];
    }

    // Return full personality profile for general queries
    if (lowerAspect.includes("all") || lowerAspect.includes("profile")) {
      return JSON.stringify(this.traits, null, 2);
    }
    console.log("✨ Persona on ✨");
    
    return "Unknown personality aspect requested";
  }
}
