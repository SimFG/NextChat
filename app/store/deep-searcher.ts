import { StoreKey } from "@/app/constant";
import { createPersistStore } from "@/app/utils/store";
import { nanoid } from "nanoid";
import {
  models,
  getModelParamBasicData,
} from "@/app/components/deep-searcher/deep-searcher-panel";
import { useAccessStore } from "./access";

const defaultModel = {
  name: models[0].name,
  value: models[0].value,
};

const defaultParams = getModelParamBasicData(models[0].params({}), {});

const DEFAULT_SD_STATE = {
  currentId: 0,
  draw: [],
  currentModel: defaultModel,
  currentParams: defaultParams,
};

export const useDeepSearcherStore = createPersistStore<
  {
    currentId: number;
    draw: any[];
    currentModel: typeof defaultModel;
    currentParams: any;
  },
  {
    getNextId: () => number;
    sendTask: (data: any, okCall?: Function) => void;
    updateDraw: (draw: any) => void;
    setCurrentModel: (model: any) => void;
    setCurrentParams: (data: any) => void;
  }
>(
  DEFAULT_SD_STATE,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = {
      getNextId() {
        const id = ++_get().currentId;
        set({ currentId: id });
        return id;
      },
      sendTask(data: any, okCall?: Function) {
        data = { ...data, id: nanoid(), status: "running" };
        set({ draw: [data, ..._get().draw] });
        this.getNextId();
        this.stabilityRequestCall(data);
        okCall?.();
      },
      stabilityRequestCall(data: any) {
        const accessStore = useAccessStore.getState();
        // let prefix: string = ApiPath.DeepSearcher as string;
        // let bearerToken = "";
        // if (accessStore.useCustomConfig) {
        //   prefix = accessStore.deepsearcherUrl || (ApiPath.DeepSearcher as string);
        // }
        const headers = {
          Accept: "application/json",
          "content-type": "application/json",
          // Authorization: bearerToken,
        };

        let base_url = accessStore.deepsearcherUrl;
        let path = "";
        const jsonData: Record<string, any> = {};
        let fetchObj: Promise<Response>;
        if (data.model == "search_action") {
          const fullUrl = base_url + "/query/";
          const url = new URL(fullUrl);
          url.searchParams.append(
            "original_query",
            data.params["original_query"],
          );
          url.searchParams.append("max_iter", data.params["max_iter"]);
          path = url.toString();
          fetchObj = fetch(path, {
            method: "GET",
            headers,
          });
        } else {
          path = base_url + "/set-provider-config/";
          jsonData["feature"] = data.model;
          jsonData["provider"] = data.params["provider"];
          jsonData["config"] = JSON.parse(data.params["config"]);
          fetchObj = fetch(path, {
            method: "POST",
            headers,
            body: JSON.stringify(jsonData),
          });
        }

        // const path = `http://172.16.81.17:8000/query/`
        // for (let paramsKey in data.params) {
        //   formData.append(paramsKey, data.params[paramsKey]);
        // }
        fetchObj
          .then((response) => {
            if (!response.ok) {
              const errorText = response.text();
              throw new Error(`HTTP Error ${response.status}: ${errorText}`);
            }
            console.log("fubang response", response);
            return response.json();
          })
          .then((resData) => {
            if (data.model == "search_action") {
              this.updateDraw({
                ...data,
                status: "success",
                img_data: `${resData.result} \n consume_token: ${resData.consume_token}`,
              });
            } else {
              this.updateDraw({
                ...data,
                status: "success",
                img_data: `
message: ${resData.message}
provider: ${resData.provider}
config: ${JSON.stringify(resData.config)}
                `,
              });
            }
            this.getNextId();
          })
          .catch((error) => {
            this.updateDraw({ ...data, status: "error", error: error.message });
            console.error("Error:", error);
            this.getNextId();
          });
      },
      updateDraw(_draw: any) {
        const draw = _get().draw || [];
        draw.some((item, index) => {
          if (item.id === _draw.id) {
            draw[index] = _draw;
            set(() => ({ draw }));
            return true;
          }
        });
      },
      setCurrentModel(model: any) {
        set({ currentModel: model });
      },
      setCurrentParams(data: any) {
        set({
          currentParams: data,
        });
      },
    };

    return methods;
  },
  {
    name: StoreKey.SdList,
    version: 1.0,
  },
);
