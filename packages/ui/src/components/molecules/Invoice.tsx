import { Page, Text, View, Image, Document, StyleSheet } from '@react-pdf/renderer';
import { p2ptransfer } from "@repo/db/type"
const styles = StyleSheet.create({
    page: {
        display: 'flex',
        flexDirection: 'column',
        paddingHorizontal: 50,
        border: '30px solid #E2136E',
    },
    second: {
        display: 'flex',
        flexDirection: 'row',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 16
    },
    textSize: {
        fontSize: 11,
    },
    textWright: {
        fontWeight: "bold",
    },
    RightTextColor: {
        color: 'gray'
    },
    firstText: {
        paddingTop: 20
    },
    midText: {
        paddingVertical: 6
    },
    lastText: {
        paddingBottom: 20
    },
    title: {
        fontSize: 15,
        paddingBottom: 20,
        paddingTop: 20,
        borderTop: '0.3px solid black',
        borderBottom: '0.3px solid black',
        borderColor: 'black',
        fontWeight: 'extrabold'
    },
    date: {
        fontSize: 14,
        marginBottom: 8
    },
    status: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: 50,
        color: 'white',
        fontSize: 12,
        paddingHorizontal: 4,
        paddingVertical: 4,
        backgroundColor: 'blue',
        borderRadius: 99,
    },
    value: {
        fontSize: 26,
        marginBottom: 10
    },
    middleBorder: {
        borderRight: '0.3px solid black',
        marginLeft: 140,
        marginRight: 30
    }
});

interface InvoiceProps {
    invoice: p2ptransfer
    currentUserId: string
}

export const Invoice = ({ invoice, currentUserId }: InvoiceProps) => {
    const timeStamp = new Date(invoice.timestamp).toLocaleString().split(",").reverse().join().replace(",", "  ")
    return (
        <Document >
            <Page style={styles.page}>
                <View style={styles.header}>
                    <View>
                        <View style={{ "marginRight": 120 }}>
                            <Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIWIEB1Etuw0r89kYr2dH4EMNDOJcJSinTdba8BiC9iH9Q_8HAnZK6Zxx2VidMrXOII_s&usqp=CAU" style={{ "width": 80, "height": 60 }} />
                        </View>
                    </View>
                    <View style={{ "display": "flex", "alignItems": "center", "justifyContent": "center" }}>
                        <View><Text style={{ "borderRight": "0.3px solid black" }}></Text></View>
                        <Text style={{ fontWeight: 'extrabold' }}>RECEIPT</Text>
                    </View>
                </View>
                {/* sender information */}
                <View>
                    <View>
                        <Text style={styles.title}>Sender Information</Text>
                    </View>
                    <View style={styles.second}>
                        <View>
                            <Text style={[styles.textSize, styles.firstText]}>Account Number</Text>
                            <Text style={[styles.textSize, styles.midText]}>Name</Text>
                            <Text style={[styles.textSize, styles.midText]}>Number</Text>
                            <Text style={[styles.textSize, styles.midText]}>Time</Text>
                            <Text style={[styles.textSize, styles.midText]}>Transaction ID</Text>
                            <Text style={[styles.textSize, styles.midText]}>Trxn Category:</Text>
                            <Text style={[styles.textSize, styles.midText]}>Trxn Fee:</Text>
                            <Text style={[styles.textSize, styles.lastText]}>Status:</Text>
                        </View>
                        <Text style={styles.middleBorder}></Text>
                        <View>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.firstText]}>{invoice.fromUserId}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.midText]}>{invoice.sender_name}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.midText]}>{invoice.sender_number}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.midText]}>{timeStamp}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.midText]}>{invoice.transactionID}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.midText]}>{invoice.transactionCategory}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.midText]}>
                                {
                                    invoice.transactionCategory === "International" ? invoice.international_trxn_fee : invoice.domestic_trxn_fee
                                } {invoice.fee_currency}
                            </Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.lastText]}>{invoice.status}</Text>
                        </View>
                    </View>
                </View>

                {/* receiver information */}
                <View>
                    <View>
                        <Text style={styles.title}>Receiver Information</Text>
                    </View>
                    <View style={styles.second}>
                        <View>
                            <Text style={[styles.textSize, styles.firstText]}>Account Number</Text>
                            <Text style={[styles.textSize, styles.midText]}>Name</Text>
                            <Text style={[styles.textSize, styles.midText]}>Number</Text>
                            <Text style={[styles.textSize, styles.lastText]}>Time</Text>

                        </View>
                        <Text style={styles.middleBorder}></Text>
                        <View>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.firstText]}>{invoice.toUserId}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.midText]}>{invoice.receiver_name}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.midText]}>{invoice.receiver_number}</Text>
                            <Text style={[styles.RightTextColor, styles.textSize, styles.lastText]}>{timeStamp}</Text>
                        </View>
                    </View>
                </View>

                {/* Button */}
                <Text style={{ "borderTop": "0.3px solid black" }}></Text>
                {
                    invoice.status === "Success" ?
                        <View style={{ "display": "flex", "flexDirection": "row", "height": "50px" }}>
                            <View style={{ "backgroundColor": "#00A651", "paddingVertical": 12, "width": "221px" }}>
                                <Text style={{ "paddingLeft": 10, "color": "white", "fontWeight": "extrabold", "fontSize": 13 }}>
                                    {invoice.sender_name === currentUserId ? "Sent Amount" : "Received Amount"}</Text>
                            </View>
                            <Text style={{ "borderRight": "0.3px solid black" }}></Text>
                            <View style={{ "paddingVertical": 20, "marginLeft": 35 }}>
                                <Text style={[{ "color": "green" }, styles.textSize, styles.lastText, styles.textWright]}>{invoice.amount / 100} {invoice.currency}</Text>
                            </View>
                        </View>
                        :
                        <View style={{ "display": "flex", "flexDirection": "row", "height": "50px" }}>
                            <View style={{ "backgroundColor": "#eb2c13", "paddingVertical": 12, "width": "221px" }}>
                                <Text style={{ "paddingLeft": 10, "color": "white", "fontWeight": "extrabold", "fontSize": 13 }}>Transaction Failed</Text>
                            </View>
                            <Text style={{ "borderRight": "0.3px solid black" }}></Text>
                            <View style={{ "paddingVertical": 20, "marginLeft": 35 }}>
                                <Text style={[{ "color": "green" }, styles.textSize, styles.lastText, styles.textWright]}>0.00 {invoice.currency}</Text>
                            </View>
                        </View>
                }
                <Text style={{ "borderBottom": "0.3px solid black" }}></Text>
            </Page>
        </Document>
    )
}