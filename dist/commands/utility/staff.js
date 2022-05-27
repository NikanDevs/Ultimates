"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const staff_1 = require("../../interactions/utility/staff");
const Command_1 = require("../../structures/Command");
const staffPermissions = [
    'ManageMessages',
    'BanMembers',
    'ManageNicknames',
    'BanMembers',
    'KickMembers',
    'ModerateMembers',
    'MuteMembers',
    'MoveMembers',
    'DeafenMembers',
    'Administrator',
];
var statusPriorities;
(function (statusPriorities) {
    statusPriorities[statusPriorities["online"] = 1] = "online";
    statusPriorities[statusPriorities["idle"] = 2] = "idle";
    statusPriorities[statusPriorities["dnd"] = 3] = "dnd";
    statusPriorities[statusPriorities["undefined"] = 4] = "undefined";
})(statusPriorities || (statusPriorities = {}));
exports.default = new Command_1.Command({
    interaction: staff_1.staffCommand,
    excute: async ({ client, interaction }) => {
        await interaction.deferReply({ ephemeral: false });
        const members = await interaction.guild.members.fetch({ force: true });
        const staff = members
            .filter((member) => staffPermissions.some((permission) => member.permissions.has(permission)) && !member.user.bot)
            .sort((a, b) => statusPriorities[a.presence?.status] - statusPriorities[b.presence?.status]);
        let statuses;
        (function (statuses) {
            statuses["online"] = "<:online:886215547249913856>";
            statuses["idle"] = "<:idle:906867112612601866>";
            statuses["dnd"] = "<:dnd:906867112222531614>";
            statuses["undefined"] = "<:offline:906867114126770186>";
        })(statuses || (statuses = {}));
        const embed = client.util
            .embed()
            .setAuthor({ name: 'Staff members', iconURL: client.user.displayAvatarURL() })
            .setColor(client.cc.ultimates)
            .setDescription(staff
            .map((staff) => `${statuses[staff.presence?.status]} • ${staff} - ${guessRole(staff)}`)
            .join('\n'));
        interaction.followUp({ embeds: [embed] });
        function guessRole(member) {
            let role;
            if (member.id === interaction.guild.ownerId) {
                role = 'Server owner';
            }
            else if (member.permissions.has('Administrator')) {
                role = 'Administrator';
            }
            else
                role = 'Moderator';
            return role;
        }
    },
});
