import { Customer } from '../customer/customer.model';
import { Provider } from '../provider/provider.model';
import { ENUM_TASK_STATUS } from '../task/task.enum';
import TaskModel from '../task/task.model';

const getDashboardMetaData = async () => {
    const [totalCustomer, totalProvider, activeTask] = await Promise.all([
        Customer.countDocuments(),
        Provider.countDocuments(),
        TaskModel.countDocuments({
            status: {
                $in: [
                    ENUM_TASK_STATUS.OPEN_FOR_BID,
                    ENUM_TASK_STATUS.IN_PROGRESS,
                ],
            },
        }),
    ]);

    return {
        totalCustomer,
        totalProvider,
        activeTask,
    };
};

const getUserChartData = async (year: number) => {
    const startOfYear = new Date(year, 0, 1);

    const endOfYear = new Date(year + 1, 0, 1);

    const chartData = await NormalUser.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfYear,
                    $lt: endOfYear,
                },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                totalUser: { $sum: 1 },
            },
        },
        {
            $project: {
                month: '$_id',
                totalUser: 1,
                _id: 0,
            },
        },
        {
            $sort: { month: 1 },
        },
    ]);

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const data = Array.from({ length: 12 }, (_, index) => ({
        month: months[index],
        totalUser:
            chartData.find((item) => item.month === index + 1)?.totalUser || 0,
    }));

    return data;
};

const getSubscriptionChartData = async (year: number) => {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const chartData = await Transaction.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: startOfYear,
                    $lt: endOfYear,
                },
                type: {
                    $in: ['Purchase Subcription', 'Review Subscription'],
                },
            },
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                totalSubscriber: { $sum: 1 },
            },
        },
        {
            $project: {
                month: '$_id',
                totalSubscriber: 1,
                _id: 0,
            },
        },
        {
            $sort: {
                month: 1,
            },
        },
    ]);

    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];

    const data = Array.from({ length: 12 }, (_, index) => ({
        month: months[index],
        totalSubscriber:
            chartData.find((item) => item.month === index + 1)
                ?.totalSubscriber || 0,
    }));

    return data;
};

const MetaService = {
    getDashboardMetaData,
    getUserChartData,
    getSubscriptionChartData,
};

export default MetaService;
