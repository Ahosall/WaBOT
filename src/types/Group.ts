import { GroupMetadata } from "@whiskeysockets/baileys";

/**
 * Type definition for group properties, which is equivalent to GroupMetadata.
 */
type TGroupProps = GroupMetadata;

/**
 * Represents a WhatsApp group and provides methods to access its metadata.
 */
class Group {
  private props: TGroupProps;

  /**
   * Creates an instance of the Group class.
   *
   * @param metadata - The metadata of the group.
   */
  constructor(metadata: GroupMetadata) {
    this.props = metadata;
  }

  /**
   * Gets the ID of the group.
   *
   * @returns The group ID.
   */
  get id() {
    return this.props.id;
  }

  /**
   * Gets the name of the group.
   *
   * @returns The group name.
   */
  get name() {
    return this.props.subject;
  }

  /**
   * Gets the description of the group.
   *
   * @returns The group description.
   */
  get description() {
    return this.props.desc;
  }

  /**
   * Gets the participants of the group.
   *
   * @returns The list of participants.
   */
  get participants() {
    return this.props.participants;
  }

  /**
   * Gets the owner of the group.
   *
   * @returns The owner of the group.
   */
  get owner() {
    return this.props.participants.find((p) => p.id === this.props.owner);
  }
}

export default Group;
