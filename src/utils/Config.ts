import * as yaml from "yaml";
import { accessSync, constants, readFileSync, writeFile } from "fs";
import { join } from "path";

/**
 * Type for configuration properties.
 */
type TConfigProps = {
  prefix: string;
};

/**
 * Checks if the configuration file exists. If it doesn't exist, creates a new file with default content.
 * @param file - The path to the configuration file.
 */
const checkConfigFileExists = (file: string) => {
  try {
    accessSync(file, constants.F_OK);
  } catch (err) {
    writeFile(file, 'prefix: "/"', () => null);
  }
};

/**
 * Class to handle configuration.
 */
class Config {
  private props: TConfigProps;

  /**
   * Creates an instance of the Config class.
   * @param file - The path to the configuration file. Default is "../../config.yaml".
   */
  constructor(file: string = "../../config.yaml") {
    checkConfigFileExists(file);

    /**
     * The properties of the configuration.
     * @private
     */
    this.props = yaml.parse(
      readFileSync(join(__dirname, file), { encoding: "utf-8" })
    ) as TConfigProps;
  }

  /**
   * Gets the prefix of the configuration.
   * @returns The prefix of the configuration.
   */
  get prefix() {
    return this.props.prefix;
  }
}

export default new Config();
