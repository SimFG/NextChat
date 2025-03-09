import styles from "./deep-searcher-panel.module.scss";
import React from "react";
import { Select } from "@/app/components/ui-lib";
import { IconButton } from "@/app/components/button";
import Locale from "@/app/locales";
import { useDeepSearcherStore } from "@/app/store/deep-searcher";
import clsx from "clsx";

export const params = [
  // {
  //   name: Locale.DeepSearcherPanel.Prompt,
  //   value: "prompt",
  //   type: "textarea",
  //   placeholder: Locale.DeepSearcherPanel.PleaseInput(Locale.DeepSearcherPanel.Prompt),
  //   required: true,
  // },
  // {
  //   name: Locale.DeepSearcherPanel.ModelVersion,
  //   value: "model",
  //   type: "select",
  //   default: "sd3-medium",
  //   support: ["sd3"],
  //   options: [
  //     { name: "SD3 Medium", value: "sd3-medium" },
  //     { name: "SD3 Large", value: "sd3-large" },
  //     { name: "SD3 Large Turbo", value: "sd3-large-turbo" },
  //   ],
  // },
  // {
  //   name: Locale.DeepSearcherPanel.NegativePrompt,
  //   value: "negative_prompt",
  //   type: "textarea",
  //   placeholder: Locale.DeepSearcherPanel.PleaseInput(Locale.DeepSearcherPanel.NegativePrompt),
  // },
  // {
  //   name: Locale.DeepSearcherPanel.AspectRatio,
  //   value: "aspect_ratio",
  //   type: "select",
  //   default: "1:1",
  //   options: [
  //     { name: "1:1", value: "1:1" },
  //     { name: "16:9", value: "16:9" },
  //     { name: "21:9", value: "21:9" },
  //     { name: "2:3", value: "2:3" },
  //     { name: "3:2", value: "3:2" },
  //     { name: "4:5", value: "4:5" },
  //     { name: "5:4", value: "5:4" },
  //     { name: "9:16", value: "9:16" },
  //     { name: "9:21", value: "9:21" },
  //   ],
  // },
  // {
  //   name: Locale.DeepSearcherPanel.ImageStyle,
  //   value: "style",
  //   type: "select",
  //   default: "3d-model",
  //   support: ["core"],
  //   options: [
  //     { name: Locale.DeepSearcherPanel.Styles.D3Model, value: "3d-model" },
  //     { name: Locale.DeepSearcherPanel.Styles.AnalogFilm, value: "analog-film" },
  //     { name: Locale.DeepSearcherPanel.Styles.Anime, value: "anime" },
  //     { name: Locale.DeepSearcherPanel.Styles.Cinematic, value: "cinematic" },
  //     { name: Locale.DeepSearcherPanel.Styles.ComicBook, value: "comic-book" },
  //     { name: Locale.DeepSearcherPanel.Styles.DigitalArt, value: "digital-art" },
  //     { name: Locale.DeepSearcherPanel.Styles.Enhance, value: "enhance" },
  //     { name: Locale.DeepSearcherPanel.Styles.FantasyArt, value: "fantasy-art" },
  //     { name: Locale.DeepSearcherPanel.Styles.Isometric, value: "isometric" },
  //     { name: Locale.DeepSearcherPanel.Styles.LineArt, value: "line-art" },
  //     { name: Locale.DeepSearcherPanel.Styles.LowPoly, value: "low-poly" },
  //     {
  //       name: Locale.DeepSearcherPanel.Styles.ModelingCompound,
  //       value: "modeling-compound",
  //     },
  //     { name: Locale.DeepSearcherPanel.Styles.NeonPunk, value: "neon-punk" },
  //     { name: Locale.DeepSearcherPanel.Styles.Origami, value: "origami" },
  //     { name: Locale.DeepSearcherPanel.Styles.Photographic, value: "photographic" },
  //     { name: Locale.DeepSearcherPanel.Styles.PixelArt, value: "pixel-art" },
  //     { name: Locale.DeepSearcherPanel.Styles.TileTexture, value: "tile-texture" },
  //   ],
  // },
  // {
  //   name: "Seed",
  //   value: "seed",
  //   type: "number",
  //   default: 0,
  //   min: 0,
  //   max: 4294967294,
  // },
  // {
  //   name: Locale.DeepSearcherPanel.OutFormat,
  //   value: "output_format",
  //   type: "select",
  //   default: "png",
  //   options: [
  //     { name: "PNG", value: "png" },
  //     { name: "JPEG", value: "jpeg" },
  //     { name: "WebP", value: "webp" },
  //   ],
  // },

  // search config
  {
    name: "query",
    value: "original_query",
    type: "textarea",
    support: ["search_action"],
    required: true,
  },
  {
    name: "iteration count",
    value: "max_iter",
    type: "number",
    support: ["search_action"],
    default: 1,
    min: 1,
    max: 100,
    required: true,
  },
  {
    name: "provider",
    value: "provider",
    type: "select",
    required: true,
    support: [
      "vector_database",
      "llm",
      "embedding",
      "file_loader",
      "web_crawler",
    ],
    options: [{ name: "Milvus", value: "milvus" }],
  },
  {
    name: "config",
    value: "config",
    type: "textarea",
    support: [
      "vector_database",
      "llm",
      "embedding",
      "file_loader",
      "web_crawler",
    ],
  },
];

const sdCommonParams = (model: string, data: any) => {
  return params.filter((item) => {
    return !(item.support && !item.support.includes(model));
  });
};

export const models = [
  {
    name: "Search",
    value: "search_action",
    params: (data: any) => sdCommonParams("search_action", data),
  },
  {
    name: "Config Vector Database",
    value: "vector_db",
    params: (data: any) =>
      sdCommonParams("vector_database", data).map((item) => {
        if (item.value === "provider") {
          item.options = [{ name: "Milvus", value: "milvus" }];
        } else if (item.value == "config") {
          data.config = `{
  "default_collection": "hello_milvus",
  "uri": "./milvus.db",
  "token": "root:Milvus",
  "db": "default"
}
        `;
        }
        return item;
      }),
  },
  {
    name: "Config LLM",
    value: "llm",
    params: (data: any) =>
      sdCommonParams("llm", data).map((item) => {
        if (item.value === "provider") {
          item.options = [
            { name: "OpenAI", value: "OpenAI" },
            { name: "DeepSeek", value: "DeepSeek" },
            { name: "SiliconFlow", value: "SiliconFlow" },
          ];
        } else if (item.value == "config") {
          if (data.provider === "OpenAI") {
            data.config = `{
  "model": "gpt-4o-mini",
  "api_key": "",
  "base_url": ""
}
          `;
          } else if (data.provider === "DeepSeek") {
            data.config = `{
  "model": "deepseek-chat",
  "api_key": "",
  "base_url": ""
}
          `;
          } else if (data.provider === "SiliconFlow") {
            data.config = `{
  "model": "deepseek-ai/DeepSeek-V3",
  "api_key": "",
  "base_url": ""
}
          `;
          } else {
            data.config = `{
  "model": "gpt-4o-mini",
  "api_key": "",
  "base_url": ""
}
          `;
          }
        }
        return item;
      }),
  },
  {
    name: "Config Embedding",
    value: "embedding",
    params: (data: any) =>
      sdCommonParams("embedding", data).map((item) => {
        if (item.value === "provider") {
          item.options = [
            { name: "OpenAIEmbedding", value: "OpenAIEmbedding" },
            { name: "MilvusEmbedding", value: "MilvusEmbedding" },
            { name: "SiliconflowEmbedding", value: "SiliconflowEmbedding" },
          ];
        } else if (item.value == "config") {
          if (data.provider === "OpenAIEmbedding") {
            data.config = `{
  "model": "text-embedding-ada-002",
  "api_key": "",
  "base_url": ""
}
          `;
          } else if (data.provider === "MilvusEmbedding") {
            data.config = `{
  "model": "default"
}
          `;
          } else if (data.provider === "SiliconflowEmbedding") {
            data.config = `{
  "model": "BAAI/bge-m3",
  "api_key": ""
}
          `;
          } else {
            // default
            data.config = `{
  "model": "text-embedding-ada-002",
  "api_key": "",
  "base_url": ""
}
          `;
          }
        }
        return item;
      }),
  },
  {
    name: "Config File Loader",
    value: "file_loader",
    params: (data: any) =>
      sdCommonParams("file_loader", data).map((item) => {
        if (item.value === "provider") {
          item.options = [
            { name: "PDFLoader", value: "PDFLoader" },
            { name: "JsonFileLoader", value: "JsonFileLoader" },
            { name: "TextLoader", value: "TextLoader" },
            { name: "UnstructuredLoader", value: "UnstructuredLoader" },
          ];
        } else if (item.value == "config") {
          data.config = "{}";
        }
        return item;
      }),
  },
  {
    name: "Config Web Crawler",
    value: "web_crawler",
    params: (data: any) =>
      sdCommonParams("web_crawler", data).map((item) => {
        if (item.value === "provider") {
          item.options = [
            { name: "FireCrawlCrawler", value: "FireCrawlCrawler" },
            { name: "Crawl4AICrawler", value: "Crawl4AICrawler" },
          ];
        } else if (item.value == "config") {
          data.config = "{}";
        }
        return item;
      }),
  },
];

export function ControlParamItem(props: {
  title: string;
  subTitle?: string;
  required?: boolean;
  children?: JSX.Element | JSX.Element[];
  className?: string;
}) {
  return (
    <div className={clsx(styles["ctrl-param-item"], props.className)}>
      <div className={styles["ctrl-param-item-header"]}>
        <div className={styles["ctrl-param-item-title"]}>
          <div>
            {props.title}
            {props.required && <span style={{ color: "red" }}>*</span>}
          </div>
        </div>
      </div>
      {props.children}
      {props.subTitle && (
        <div className={styles["ctrl-param-item-sub-title"]}>
          {props.subTitle}
        </div>
      )}
    </div>
  );
}

export function ControlParam(props: {
  columns: any[];
  data: any;
  onChange: (field: string, val: any) => void;
}) {
  return (
    <>
      {props.columns?.map((item) => {
        let element: null | JSX.Element;
        switch (item.type) {
          case "textarea":
            element = (
              <ControlParamItem
                title={item.name}
                subTitle={item.sub}
                required={item.required}
              >
                <textarea
                  rows={item.rows || 3}
                  style={{ maxWidth: "100%", width: "100%", padding: "10px" }}
                  placeholder={item.placeholder}
                  onChange={(e) => {
                    props.onChange(item.value, e.currentTarget.value);
                  }}
                  value={props.data[item.value]}
                ></textarea>
              </ControlParamItem>
            );
            break;
          case "select":
            element = (
              <ControlParamItem
                title={item.name}
                subTitle={item.sub}
                required={item.required}
              >
                <Select
                  aria-label={item.name}
                  value={props.data[item.value]}
                  onChange={(e) => {
                    props.onChange(item.value, e.currentTarget.value);
                  }}
                >
                  {item.options.map((opt: any) => {
                    return (
                      <option value={opt.value} key={opt.value}>
                        {opt.name}
                      </option>
                    );
                  })}
                </Select>
              </ControlParamItem>
            );
            break;
          case "number":
            element = (
              <ControlParamItem
                title={item.name}
                subTitle={item.sub}
                required={item.required}
              >
                <input
                  aria-label={item.name}
                  type="number"
                  min={item.min}
                  max={item.max}
                  value={props.data[item.value] || 0}
                  onChange={(e) => {
                    props.onChange(item.value, parseInt(e.currentTarget.value));
                  }}
                />
              </ControlParamItem>
            );
            break;
          default:
            element = (
              <ControlParamItem
                title={item.name}
                subTitle={item.sub}
                required={item.required}
              >
                <input
                  aria-label={item.name}
                  type="text"
                  value={props.data[item.value]}
                  style={{ maxWidth: "100%", width: "100%" }}
                  onChange={(e) => {
                    props.onChange(item.value, e.currentTarget.value);
                  }}
                />
              </ControlParamItem>
            );
        }
        return <div key={item.value}>{element}</div>;
      })}
    </>
  );
}

export const getModelParamBasicData = (
  columns: any[],
  data: any,
  clearText?: boolean,
) => {
  const newParams: any = {};
  columns.forEach((item: any) => {
    if (clearText && ["text", "textarea", "number"].includes(item.type)) {
      newParams[item.value] = item.default || "";
    } else {
      // @ts-ignore
      newParams[item.value] = data[item.value] || item.default || "";
    }
  });
  return newParams;
};

export const getParams = (model: any, params: any) => {
  return models.find((m) => m.value === model.value)?.params(params) || [];
};

export function SdPanel() {
  const sdStore = useDeepSearcherStore();
  const currentModel = sdStore.currentModel;
  const setCurrentModel = sdStore.setCurrentModel;
  const params = sdStore.currentParams;
  const setParams = sdStore.setCurrentParams;

  const handleValueChange = (field: string, val: any) => {
    setParams({
      ...params,
      [field]: val,
    });
  };
  const handleModelChange = (model: any) => {
    setCurrentModel(model);
    setParams(getModelParamBasicData(model.params({}), params));
  };

  return (
    <>
      <ControlParamItem title={Locale.DeepSearcherPanel.AIModel}>
        <div className={styles["ai-models"]}>
          {models.map((item) => {
            return (
              <IconButton
                text={item.name}
                key={item.value}
                type={currentModel.value == item.value ? "primary" : null}
                shadow
                onClick={() => handleModelChange(item)}
              />
            );
          })}
        </div>
      </ControlParamItem>
      <ControlParam
        columns={getParams?.(currentModel, params) as any[]}
        data={params}
        onChange={handleValueChange}
      ></ControlParam>
    </>
  );
}
