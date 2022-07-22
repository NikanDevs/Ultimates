export function isDiscordInvite(str: string) {
	var res = str.match(
		/(https?:\/\/)?(www.)?(discord.(gg|io|me|li|link|plus)|discorda?pp?.com\/invite|invite.gg|dsc.gg|urlcord.cf)\/[^\s/]+?(?=\b)/
	);
	return res !== null;
}
